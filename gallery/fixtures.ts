import { getInitialSessionState, type SimulatorSessionState } from '@signalsafe/simulator-react';
export type GalleryState = 'populated' | 'empty' | 'loading' | 'disabled' | 'error';
export function fixture(mode: GalleryState) {
  const empty = mode === 'empty' || mode === 'loading';
  const payload: SimulatorSessionState['payload'] = {
    templateKey:'synthetic-gallery', name:'Synthetic UI gallery', channel:'phone', templateId:null, runId:null, attemptId:null, topicTags:[], entryPoint:{app:'phone',screen:'dial'},
    device:null, browser:null, directory:[], home:null,
    contacts:empty ? [] : [{id:'synthetic-contact',displayName:'Taylor Example',number:'+12025550123',phoneNumbers:[{label:'Mobile',value:'+12025550123',number:'+12025550123'},{label:'Work',value:'+442083661177',number:'+442083661177'}],emailAddresses:[{label:'Work',value:'taylor@example.test'}],postalAddresses:[{label:'Home',value:'10 Example Street\nExample City'}]}],
    phone:{content:{transcript:'Synthetic call',choices:[]},chosenIndex:null,callHistory:empty ? [] : [{id:'call-1',name:'Taylor Example',number:'+12025550123',numberLabel:'Mobile',kind:'incoming',timestamp:'Sep 16, 2026',durationSeconds:0},{id:'call-2',number:'+442083661177',kind:'missed',timestamp:'Sep 15, 2026'}]},
    email:{inbox:empty ? [] : [{id:'email-1',from:'taylor@example.test',subject:'Synthetic preview',snippet:'No external email is sent.'}],selectedMessage:null,selectedMessageId:null},
    sms:{thread:{sender_number:'+12025550123',messages:empty ? [] : [{from:'them',text:'Synthetic message. No external service is connected.'}]},visibleMessageCount:1,loadingMessage:mode==='loading' ? 'Loading synthetic messages…' : undefined},
  };
  return getInitialSessionState(payload);
}
