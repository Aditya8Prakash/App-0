import React from "react";
import {View, TextInput, TouchableOpacity, Dimensions} from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import {RFValue} from "react-native-responsive-fontsize";
var display = {width: Dimensions.get('window').width,height: Dimensions.get('window').height};
export default class CustomInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isVisible:this.props.secureTextEntry?true:false}
    }
    toogleIsVisible = () => this.state.isVisible?this.setState({isVisible:false}):this.setState({isVisible:true});
    render() { return (<View style={{flexDirection:'row',alignItems:'center',width:display.width-50<350 === true?display.width-50:350,alignSelf:'center'}}><TextInput style = {[this.props.style,{width:display.width-100<350 === true?display.width-50:350,fontSize:RFValue(14),fontWeight:'400',alignSelf:'center',color:'#000000',paddingVertical:RFValue(4),paddingHorizontal:RFValue(7),marginVertical:5,backgroundColor:'#ffffff44',alignContent:'center',justifyContent:'center',alignSelf:'center'}]} placeholder={this.props.placeholder} keyboardType={this.props.keyboardType} secureTextEntry={this.state.isVisible} value={this.props.value} onChangeText={this.props.onChangeText}/>{this.props.keyboardType === 'default'?<TouchableOpacity style={{left:-RFValue(28)}} onPress={this.toogleIsVisible}><Icon style={{color:'#00000099',fontSize:RFValue(23)}} name={this.state.isVisible?'eyeo':'eye'}/></TouchableOpacity>:<View/>}</View>);}
}