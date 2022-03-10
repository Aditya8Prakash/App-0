import React from "react";
import {View} from "react-native";
export default class Row extends React.Component {
    constructor(props) {super(props);}
    render() {return <View style={{alignItems:'center',justifyContent:'center',alignContent:'center',flexDirection:'row'}}>{this.props.children}</View>}
}