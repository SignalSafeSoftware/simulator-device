import { render, fireEvent, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SimulatorAppearanceSettings from '../src/appearance/SimulatorAppearanceSettings';
import BackgroundImageField from '../src/appearance/BackgroundImageField';

it('previews individual colors and removes a background before applying', () => {
    const onApply = vi.fn();
    const view = render(<SimulatorAppearanceSettings value={{ background: '#ffffff', accent: '#000000', backgroundImage: 'data:image/png;base64,AA' }} presets={[]} onApply={onApply} onReset={vi.fn()} />);
    fireEvent.change(view.getByLabelText('Background color'), { target: { value: '#112233' } });
    fireEvent.change(view.getByLabelText('Accent color'), { target: { value: '#445566' } });
    fireEvent.change(view.getByLabelText('Theme'), { target: { value: 'missing' } });
    fireEvent.click(view.getByRole('button', { name: 'Remove background image' }));
    fireEvent.click(view.getByRole('button', { name: 'Apply appearance' }));
    expect(onApply).toHaveBeenCalledWith({ background: '#112233', accent: '#445566', backgroundImage: undefined });
});
it('ignores cancelled file selection and reports a FileReader error', async () => {
    const onChange = vi.fn();
    const read = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
        this.dispatchEvent(new ProgressEvent('error'));
    });
    try {
        const view = render(<BackgroundImageField onChange={onChange} />);
        fireEvent.change(view.getByLabelText('Background image'), { target: { files: [] } });
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.change(view.getByLabelText('Background image'), { target: { files: [new File(['data'], 'image.png', { type: 'image/png' })] } });
        await waitFor(() => expect(view.getByText(/could not be read/)).toBeDefined());
        expect(onChange).not.toHaveBeenCalled();
    } finally { read.mockRestore(); }
});

it('resets without a preset while retaining the current colors', () => {
    const onReset = vi.fn();
    const onApply = vi.fn();
    const value = { background: '#010203', accent: '#ffffff' };
    const view = render(<SimulatorAppearanceSettings value={value} presets={[]} onApply={onApply} onReset={onReset} />);
    fireEvent.click(view.getByRole('button', { name: 'Reset appearance' }));
    fireEvent.click(view.getByRole('button', { name: 'Apply appearance' }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(onApply).toHaveBeenCalledWith(value);
});

it('ignores stale file readers and non-string results', () => {
    const readers: FileReader[] = [];
    const read = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) { readers.push(this); });
    const onChange = vi.fn();
    try {
        const view = render(<BackgroundImageField onChange={onChange} />);
        const input = view.getByLabelText('Background image');
        const file = new File(['data'], 'image.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [file] } });
        fireEvent.change(input, { target: { files: [file] } });
        expect(readers).toHaveLength(2);
        for (const reader of readers) reader.dispatchEvent(new ProgressEvent('load'));
        expect(onChange).not.toHaveBeenCalled();
    } finally { read.mockRestore(); }
});
