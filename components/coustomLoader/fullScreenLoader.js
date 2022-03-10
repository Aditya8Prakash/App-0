import React from 'react';
import {Text,Dimensions,View} from 'react-native'
import CoustomLoader from './coustomLoader';
import {RFValue} from "react-native-responsive-fontsize";
const FullScreenLoader = ({text,color,backgroundColor}) => {
    var display = {width: Dimensions.get('window').width,height: Dimensions.get('window').height};
    return <View style={{flex:1,justifyContent:'center',alignItems:'center',alignSelf:'center',height:display.height,width:display.width,backgroundColor:backgroundColor}}><Text style={{fontSize:RFValue(22),paddingVertical:75,color:color}}>{text}</Text><CoustomLoader color={color}/></View>
}
export default FullScreenLoader;