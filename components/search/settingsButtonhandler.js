import React from "react";
import {Text,View} from "react-native";
import {TouchableRipple} from 'react-native-paper';
import {RFValue} from 'react-native-responsive-fontsize'
import Icon from 'react-native-vector-icons/AntDesign';
export default class SettingsButtonHandler extends React.Component {
    constructor(props) {super(props);}
    render() {return <View style={this.props.cntstyle}><TouchableRipple rippleColor={this.props.rippleColor} style = {[this.props.style,{paddingVertical:5,borderWidth:3,borderColor:this.props.style.borderColor,width:RFValue(110),alignItems:'center'}]} onPress={this.props.onPress}><View style={{justifyContent:'space-evenly',alignItems:'center',alignContent:'center',flexDirection:'row'}}>{this.props.noIcon?<View/>:<Icon name={this.props.icon} style = {{fontSize:23,color:this.props.style.textColor,letterSpacing:-1.5,paddingRight:10}}/>}<Text style = {{fontSize:RFValue(20),color:this.props.style.textColor,letterSpacing:-1.5}}>{this.props.text}</Text></View></TouchableRipple></View>}
}