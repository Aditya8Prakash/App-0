import React from "react";
import {Text,View} from "react-native";
import {TouchableRipple} from 'react-native-paper';
import { RFValue} from 'react-native-responsive-fontsize';
export default class DashboardButton extends React.Component {
    constructor(props) {super(props);}
    render() {return <View style={[this.props.style,{overflow:'hidden'}]}><TouchableRipple rippleColor={this.props.rippleColor} style = {[this.props.OPstyle,{paddingVertical:6,borderWidth:3,width:RFValue(100),alignItems:'center'}]} onPress={this.props.onPress} disabled={this.props.disabled} ><Text style = {{fontSize:RFValue(25),letterSpacing:-1.5,color:this.props.color}}>{this.props.text}</Text></TouchableRipple></View>}
}