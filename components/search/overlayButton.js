import React from "react";
import {Text, View} from "react-native";
import {TouchableRipple} from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
export default class OverlayButton extends React.Component {
    constructor(props) {super(props);}
    render() {return <View style={this.props.ctnstyle}><TouchableRipple rippleColor={this.props.rippleColor} style = {[this.props.style,{paddingVertical:5,borderWidth:3,borderColor:this.props.style.borderColor,width:RFValue(210),alignItems:'center'}]} onPress={this.props.onPress} ><Text style = {{fontSize:RFValue(20),color:this.props.style.textColor,letterSpacing:-1.5}}>{this.props.text}</Text></TouchableRipple></View>}
}