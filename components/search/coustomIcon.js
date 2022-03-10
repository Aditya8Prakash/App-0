import React from "react";
import {TouchableOpacity} from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import {RFValue} from "react-native-responsive-fontsize";
export default class CustomIcon extends React.Component {
    constructor(props) {super(props);}
    render() { return <TouchableOpacity style={{marginTop:5}} onPress={this.props.onPress}><Icon name={this.props.name} style={{color:'#ffffff',fontSize:RFValue(32),transform: [{ rotate: this.props.rotate+'deg'}]}}/></TouchableOpacity>}
}