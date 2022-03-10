import React from "react";
import {Text} from "react-native";
import {TouchableRipple} from 'react-native-paper';
import {RFValue} from "react-native-responsive-fontsize";
export default class CustomButton extends React.Component {
    constructor(props) {super(props);}
    render() { return <TouchableRipple rippleColor='#00000022' style = {[this.props.style,{paddingVertical:RFValue(5),paddingHorizontal:RFValue(7),backgroundColor:'#ffffff44',width:RFValue(100),marginVertical:10,marginHorizontal:5,alignItems:'center'}]} onPress={this.props.onPress}><Text style = {{fontSize:RFValue(17),fontWeight:'300',color:'#000000'}}>{this.props.text}</Text></TouchableRipple>}
}