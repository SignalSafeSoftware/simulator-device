import type { Photo, PhotoMetadata } from '@signalsafe/simulator-core/apps/contracts';
import cave from './photos/raccoon-cave.jpg?inline';
import hotel from './photos/koh-samet-hotel.jpg?inline';
import squirrel from './photos/relaxing-squirrel.jpg?inline';
import cat from './photos/friendly-cat.jpg?inline';
import rooftop from './photos/cartagena-rooftop.jpg?inline';

function samplePhoto(
    id: string,
    title: string,
    caption: string,
    data: string,
    metadata: PhotoMetadata,
    createdAt: string,
): Photo {
    return {
        id,
        title,
        caption,
        asset: { name: `${id}.jpg`, mime: 'image/jpeg', data },
        metadata: { ...metadata },
        original: { ...metadata },
        createdAt,
        updatedAt: createdAt,
    };
}

/** Bundled demo photos; capture details come from the originals and nothing is fetched at runtime. */
export function createDemoPhotos(): Photo[] {
    return [
        samplePhoto(
            'demo-photo-cave',
            'Raccoon cave',
            'Colored lights inside Raccoon cave near Chattanooga.',
            cave,
            {
                capturedAt: '2026-08-19T15:56:41',
                timeZone: 'America/New_York',
                latitude: 35.021656,
                longitude: -85.400786,
            },
            '2026-08-19T19:56:41.000Z',
        ),
        samplePhoto(
            'demo-photo-hotel',
            'Koh Samet hotel',
            'A hotel balcony overlooking the sea at Koh Samet.',
            hotel,
            {
                capturedAt: '2026-04-18T06:07:58',
                timeZone: 'Asia/Bangkok',
                latitude: 12.567222,
                longitude: 101.464492,
            },
            '2026-04-17T23:07:58.000Z',
        ),
        samplePhoto(
            'demo-photo-squirrel',
            'Relaxing squirrel',
            'A squirrel resting on a tree branch.',
            squirrel,
            {
                capturedAt: '2026-04-04T14:30:24',
                timeZone: 'America/Denver',
                latitude: 39.706897,
                longitude: -104.972808,
            },
            '2026-04-04T20:30:24.000Z',
        ),
        samplePhoto(
            'demo-photo-cat',
            'Friendly cat',
            'A cat sitting on a hotel reception desk.',
            cat,
            {
                capturedAt: '2025-02-16T07:22:34',
                timeZone: 'Asia/Bangkok',
                latitude: 12.761067,
                longitude: 100.897658,
            },
            '2025-02-16T00:22:34.000Z',
        ),
        samplePhoto(
            'demo-photo-rooftop',
            'Cartagena rooftop',
            'A rooftop view of Cartagena at night.',
            rooftop,
            {
                capturedAt: '2023-02-24T21:13:23',
                timeZone: 'America/Bogota',
                latitude: 10.422925,
                longitude: -75.550658,
            },
            '2023-02-25T02:13:23.000Z',
        ),
    ];
}
