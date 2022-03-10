import React from "react";
import {Dimensions,View,TouchableOpacity,Text,Animated} from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import {RFValue} from 'react-native-responsive-fontsize';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { ImageManipulator } from 'expo-image-crop';
var display = {width: Dimensions.get('window').width,height: Dimensions.get('window').height};
export default class ImageContnr extends React.Component {
    constructor(props) {
        super(props);
        this.state={isFullScreen:false,inEditMode:false};
        this.opacity = new Animated.Value(0);
        this.launchanimeOpacity = new Animated.Value(0);
        this.scale = new Animated.Value(0);
        this.cropViewRef = null;
    }
    setFullScreen=val=>{
        if (val) {
            this.setState({isFullScreen:val},()=>Animated.timing(this.opacity, {toValue: 1,duration: 250,useNativeDriver:true}).start());
        } else {
            Animated.timing(this.opacity, {toValue: 0,duration: 250,useNativeDriver:true}).start()
            setTimeout(() => {this.setState({isFullScreen:val})}, 251);
        }
    }
    setEditMode=val=>this.setState({inEditMode:val});
    componentDidMount(){setTimeout(() => {Animated.timing(this.launchanimeOpacity, {toValue: 1,duration: 250,useNativeDriver:true}).start()}, 251);}
    render () {
        return (
            <View>
                    <Animated.View style={{opacity:this.launchanimeOpacity,width:display.width-75<350?display.width-75:350,height:display.width-75<350?display.width-75:350,borderRadius:15,position:'relative',overflow:'hidden'}}>
                        <Animated.Image style={{width:display.width-75<350?display.width-75:350,height:display.width-75<350?display.width-75:350,backgroundColor:'#80808033'}} source={{ uri: this.props.uri }}/>
                        <TouchableOpacity style={{position:'absolute',bottom:0,right:0,paddingVertical:RFValue(5),paddingHorizontal:RFValue(7),backgroundColor:'#23af9599',borderTopLeftRadius:15}} onPress={()=>this.setFullScreen(true)}><Icon name='edit' style={{color:'#ffffff',fontSize:RFValue(25)}}/></TouchableOpacity>
                    </Animated.View>
                {
                    this.state.isFullScreen?
                        <Animated.View style={{top:-(display.width-75<350?display.width-75:350)/2,opacity:this.opacity,position:'absolute',flex: 1,backgroundColor:this.props.Theme.backgroundColor,zIndex:77,height:display.height,width:display.width+10,alignSelf:'center',alignItems:'center'}}>
                            <ReactNativeZoomableView style={{alignSelf:'center',alignItems:'center',top:-RFValue(15)}} zoomEnabled={true} maxZoom={2.25} minZoom={0.5} zoomStep={0.1} initialZoom={1} bindToBorders={true}><Animated.Image style={{width:display.width,height:display.height}} source={{ uri: this.props.uri }} resizeMode="contain"/></ReactNativeZoomableView>
                                <View style={{alignItems:'center',justifyContent:'space-evenly',alignContent:'center',flexDirection:'row',position:"absolute",backgroundColor:this.props.Theme.themeTypeInfo==='light'?'#00000077':'#00000044',width:display.width,top:display.height-RFValue(125),zIndex:79,paddingTop:15,paddingBottom:RFValue(10)}}>
                                    <TouchableOpacity style={{flexDirection:'column',justifyContent:'center',alignItems:'center',padding:10,width:RFValue(110)}} onPress={()=>this.setFullScreen(false)}><Icon name='close' style={{color:'#ffffff',fontSize:RFValue(22)}}/><Text style={{color:'#ffffff',fontSize:RFValue(16)}}>Cancel</Text></TouchableOpacity>
                                    <TouchableOpacity style={{flexDirection:'column',justifyContent:'center',alignItems:'center',padding:10,width:RFValue(110)}} onPress={this.props.onSave}><Icon name='save' style={{color:'#ffffff',fontSize:RFValue(22)}}/><Text style={{color:'#ffffff',fontSize:RFValue(16)}}>Save</Text></TouchableOpacity>
                                    <TouchableOpacity style={{flexDirection:'column',justifyContent:'center',alignItems:'center',padding:10,width:RFValue(110)}} onPress={()=>this.setEditMode(true)}><Icon name='edit' style={{color:'#ffffff',fontSize:RFValue(22)}}/><Text style={{color:'#ffffff',fontSize:RFValue(16)}}>Edit</Text></TouchableOpacity>
                                    <TouchableOpacity style={{flexDirection:'column',justifyContent:'center',alignItems:'center',padding:10,width:RFValue(110)}} onPress={this.props.onRemove}><Icon name='delete' style={{color:'#ffffff',fontSize:RFValue(22)}}/><Text style={{color:'#ffffff',fontSize:RFValue(16)}}>Delete</Text></TouchableOpacity>
                                </View>
                                    <ImageManipulator onPictureChoosed={result=>this.props.onEdit(result.uri)} photo={{ uri:this.props.uri }} isVisible={this.state.inEditMode} onToggleModal={()=>this.setEditMode(false)}/>
                        </Animated.View>:<View/>
                }
            </View>
        );
    }
}