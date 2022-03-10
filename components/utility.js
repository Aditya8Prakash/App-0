import {ToastAndroid, Clipboard} from 'react-native';
const utility = {
    createUniqueId:()=>{return Math.random().toString(36).substring(7);},
    exportClipboardInfo:(info,text)=>{Clipboard.setString(info);ToastAndroid.show(text,1500);},
    convertStringToBooliean:str=>{var isTrue=(str==='true');return isTrue;},
    convertStringToJSON:str=>{var json=JSON.parse(str);return json;},
}
export default utility;