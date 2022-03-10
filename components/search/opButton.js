import React from "react";
import {Text} from "react-native";
import {TouchableRipple} from 'react-native-paper';
import {RFValue} from 'react-native-responsive-fontsize';
export default class OpButton extends React.Component {
    constructor(props) {super(props);}
    render() {return <TouchableRipple rippleColor={this.props.rippleColor} style = {{paddingVertical:5,paddingHorizontal:15,backgroundColor:'none',borderWidth:3,borderColor:this.props.style.borderColor,width:RFValue(275),borderRadius:8,alignItems:'center',marginVertical:6}} onPress={this.props.onPress} ><Text style = {{fontSize:RFValue(22),color:this.props.style.textColor,letterSpacing:-1.5}}>{this.props.text}</Text></TouchableRipple>   }
}