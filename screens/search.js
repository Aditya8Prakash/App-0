import React from 'react';
import firebase from 'firebase';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Dimensions, Linking, Vibration, AsyncStorage, Share, ToastAndroid} from 'react-native';
import {Header, Overlay} from 'react-native-elements';
import {List, Divider, Switch, Menu, Provider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import Slider from '@react-native-community/slider'
import {RFValue} from "react-native-responsive-fontsize";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from "expo-permissions";
import * as MediaLibrary from 'expo-media-library';
import {Camera} from 'expo-camera';
import SurfaceLoader from '../components/coustomLoader/surfaceLoader';
import FullScreenLoader from '../components/coustomLoader/fullScreenLoader';
import CustomIcon from '../components/search/coustomIcon';
import DashboardButton from '../components/search/dashboardButton'
import ImageContnr from '../components/search/imageContnr';
import SettingsButtonHandler from '../components/search/settingsButtonhandler';
import Row from '../components/search/row';
import utility from '../components/utility';
import OverlayButton from '../components/search/overlayButton';
import OpButton from '../components/search/opButton';
import ThemePreset from '../config_files/theme';
import db from "../config";
var imagePlaceholder = 'https://cdn.discordapp.com/attachments/775183012027564039/867059820329828372/refreshed-image.png';
var display = {width: Dimensions.get('window').width,height: Dimensions.get('window').height};
var versionInfo = {initialVersionCode:0.1,versionCode:''};
var APIfeature = [{ type: "LABEL_DETECTION", maxResults: 6 },{ type: "LANDMARK_DETECTION", maxResults: 3 },{ type: "FACE_DETECTION", maxResults: 3 },{ type: "LOGO_DETECTION", maxResults: 3 },{ type: "TEXT_DETECTION", maxResults: 3 },{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 3 },{ type: "SAFE_SEARCH_DETECTION", maxResults: 3 },{ type: "IMAGE_PROPERTIES", maxResults: 5 },];
export default class SearchScreen extends React.Component {
    constructor () {
        super();
        this.camera = null;
    }
    state = {
        camMode:Camera.Constants.Type.back,
        flash:Camera.Constants.FlashMode.off,
        autoFocus:Camera.Constants.AutoFocus.on,
        whiteBlcProps:Camera.Constants.WhiteBalance.auto,
        zoom:0,
        cameraReady:false,
        imageLoading:false,
        cameraInUse:false,
        optionInUse:false,
        settingInUse:false,
        image: imagePlaceholder,
        menu:false,
        response:'',
        theme:false,
        modal:false,
        loading:false,
        contentLoading:true,
        hasCameraPremission: null,
    }
    launchInfo=()=>{
        var info = 'Version : '+versionInfo.initialVersionCode+'\nLatest_Version : '+versionInfo.versionCode+'\nDate : '+Date()+'\nApp_Status : OK \nAPI_Level : '+APIfeature.length;
        Alert.alert('Info :',info,[{text: 'copy info', onPress: () => utility.exportClipboardInfo(info,'Copied to Clipboard')},{ text: "OK"}]);
    }
    unloadLoadingApp=val=>setTimeout(()=>this.setState({contentLoading:val}),1000);
    toogleCam=()=>this.state.camMode===Camera.Constants.Type.back?this.setState({camMode:Camera.Constants.Type.front}):this.setState({camMode:Camera.Constants.Type.back});
    toogleFlash=()=>this.state.flash===Camera.Constants.FlashMode.on?this.setState({flash:Camera.Constants.FlashMode.off}):this.setState({flash:Camera.Constants.FlashMode.on});
    toogleAutoFocus=()=>this.state.autoFocus===Camera.Constants.AutoFocus.on?this.setState({autoFocus:Camera.Constants.AutoFocus.off}):this.setState({autoFocus:Camera.Constants.AutoFocus.on});
    camState=val=>this.setState({cameraReady:val});
    launchMenu=val=>this.setState({menu:val})
    launchModal=val=>this.setState({modal:val});
    launchSettings=val=>this.setState({settingInUse:val,modal:false});
    launchCam=val=>this.setState({cameraInUse:val,cameraReady:false,imageLoading:false,zoom:0});
    launchOptions=val=>this.setState({optionInUse:val});
    logOut=()=>firebase.auth().signOut().then(this.destroyDataSaved());
    getCameraPermissions=async()=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        await this.setState({hasCameraPremission:status==='granted'});
    }
    pickImage = async () => {
        var result = await ImagePicker.launchImageLibraryAsync({mediaTypes: ImagePicker.MediaTypeOptions.Images,allowsEditing: true,quality: 1,allowsMultipleSelection :false});
        if (result.cancelled) {this.setState({image:imagePlaceholder},()=>ToastAndroid.show('Image selection cancelled',1500));} else {this.setState({image:result.uri});}
    };
    takeASnap=async()=>{
        if (this.camera) {
            var obj = await this.camera.takePictureAsync({ quality: 1, base64: true, skipProcessing:true})
            await this.setState({imageLoading:true},()=>setTimeout(async()=>await this.setState({cameraInUse:false,image:obj.uri}), 850));
        }
    }
    saveImage=async()=>{
        if (this.state.image !== imagePlaceholder) {
        const {status}=await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status==='granted') {
                const asset = await MediaLibrary.createAssetAsync(this.state.image);
                const DCIM_id = asset.albumId.toString();
                await MediaLibrary.createAlbumAsync('Find-By-Image', asset);
                await MediaLibrary.removeAssetsFromAlbumAsync([asset], DCIM_id);
                ToastAndroid.show("Image Saved !",1500);
            } else {
                ToastAndroid.show("Image Saving Cancelled",1500);
            }
        } else {
            ToastAndroid.show("Image is not selected",1500);
        }
    }
    cancl=()=>{if (this.state.image !== imagePlaceholder) {this.setState({image:imagePlaceholder},()=>Vibration.vibrate());} else {ToastAndroid.show('Image is not selected',1500);}}
    uploadImage = async (uri, id) => {
        var response = await fetch(uri);
        var blob = await response.blob();
        return firebase.storage().ref().child('user_Searches/'+'image_'+id+id).put(blob).then(response=>this.fetchImage(id));
    };
    fetchImage=id=>firebase.storage().ref().child('user_Searches/'+'image_'+id+id).getDownloadURL().then(url=>this.setState({image:url})).catch(error=>Alert.alert('An Error Occured : ( \n >> '+error+' <<'));
    findImage=async()=>{
        if (this.state.image !== imagePlaceholder) {
            console.log(APIfeature);
            await this.uploadImage(this.state.image,utility.createUniqueId());
            try {
                var body = JSON.stringify({requests: [{features: APIfeature,image: {source: {imageUri: this.state.image}}}]});
                var response = await fetch("https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBiY6PSC4fxAM6FyAqdffZH_3YcP_cYNfs",{headers: {Accept: "application/json","Content-Type": "application/json"},method: "POST",body: body});
                var responseJson = await response.json();
                this.setState({response: responseJson},()=>{
                    Vibration.vibrate();
                    var a = responseJson.responses;
                    console.log(a);
                    // for (let i = 0; i < a.length; i++) {
                    //     var element = a[i];
                    //     console.log(element);
                    // }
                });
            } catch (error) {console.log(error)}
        } else {ToastAndroid.show('Image is not selected',1500);}
    }
    getDataFromServer = async () =>{
        await firebase.database().ref('/').once('value',data=>versionInfo.versionCode=data.val().versionCode,err=>Alert.alert(err.message));
        if (versionInfo.versionCode !== versionInfo.initialVersionCode) {Alert.alert('You are using older version of this app \nYou are recomended to update the app from Google PlayStore');}
    } 
    changeVal=async val=>this.setState({theme:val,optionInUse:false,loading:true},()=>setTimeout(async()=>{await this.storeTheme();this.setState({optionInUse:true,loading:false})}, 1000));
    storeTheme = async () => {try {await AsyncStorage.setItem('theme',this.state.theme.toString())} catch (error) {Alert.alert(error);}}
    retrieveTheme = async () => {try {const value = await AsyncStorage.getItem('theme');if (value !== null) {this.setState({theme:(utility.convertStringToBooliean(value))})}} catch (error) {Alert.alert(error);}}
    changeImage = uri => this.setState({image:uri});
    onShare = async () => {try {var result = await Share.share({message:'https://aditya-prakash-yt.github.io/aditya-prakash-yt.com/',})} catch (error) {alert(error.message);}};
    destroyDataSaved=async()=> {
        try {await AsyncStorage.clear()} catch (error) {Alert.alert(error);};
        this.props.navigation.navigate('LoginScreen');
    }
    componentDidMount(){
        this.getDataFromServer();
        this.getCameraPermissions();
        this.retrieveTheme();
        this.unloadLoadingApp(false);
    }
    render(){
        var Theme = {}
        if (this.state.theme) {Theme=ThemePreset.dark} else {Theme=ThemePreset.light}
        if (this.state.contentLoading) {
            return <FullScreenLoader text='Please Wait Loading App : )' color={Theme.color} backgroundColor={Theme.backgroundColor}/>
        } else {
            if (!this.state.cameraInUse) {
                return (
                    <SafeAreaProvider>
                        <Provider>
                            <Header backgroundColor='#3b9ca3' containerStyle={{zIndex:69}}>
                                <View/>
                                <Text style={styles.headingStyle}>Find-By-Image</Text>
                                <View style={{position:'absolute',zIndex:10}}>
                                    <Menu visible={this.state.menu} anchor={<CustomIcon onPress={()=>this.launchMenu(true)} name='ellipsis1' rotate={90}/>} onDismiss={()=>this.launchMenu(false)} contentStyle={{borderTopRightRadius:0,borderRadius:20,backgroundColor:Theme.backgroundColorElivated,marginTop:20,marginRight:20}}>
                                        <Menu.Item icon={()=><Icon name='setting' style={{fontSize:25,color:Theme.color}} />} titleStyle={{color:Theme.color,fontSize:18}} onPress={() => {this.launchOptions(true);this.launchMenu(false)}} title="Settings" />
                                        <Menu.Item icon={()=><Icon name='staro' style={{fontSize:25,color:Theme.color}} />} titleStyle={{color:Theme.color,fontSize:18}} onPress={()=>Linking.openURL('market://details?id=')} title="Rate App" />
                                        <Menu.Item icon={()=><Icon name='ellipsis1' style={{fontSize:25,color:Theme.color}}/>} titleStyle={{color:Theme.color,fontSize:18}} onPress={() => {this.launchSettings(true);this.launchMenu(false)}} title="More"/>
                                            <Divider style={styles.devdColor}/>
                                        <Menu.Item icon={()=><Icon name='logout' style={{fontSize:25,color:'#ff0000'}} />} titleStyle={{color:'#ff0000',fontSize:18}} onPress={this.logOut} title="Logout"/>
                                    </Menu>
                                </View>
                            </Header>
                            {
                                this.state.loading?
                                    <FullScreenLoader text='Loading Theme' color={Theme.color} backgroundColor={Theme.backgroundColor}/>
                                :
                                    <View style={[styles.container,{backgroundColor:Theme.backgroundColor}]}>
                                        <View style={styles.imageContainer}>
                                            <ImageContnr Theme={Theme} uri={this.state.image} onEdit={uri=>this.changeImage(uri)} onRemove={this.cancl} onSave={this.saveImage}/>
                                            <Text style={[styles.txt1,{color:Theme.color,margin:RFValue(12)}]}>Pick Image from :</Text>
                                                <View style={{flexDirection:'column',alignSelf:'center'}}>
                                                    <Row>
                                                        <DashboardButton style={{padding:RFValue(5)}} text='Gallery' onPress={this.pickImage} OPstyle={{backgroundColor:'none',borderColor:'#29cfb0',textColor:'#29cfb0',borderTopLeftRadius:10}} color='#29cfb0' rippleColor='#29cfb033' disabled={false}/>
                                                        <DashboardButton style={{padding:RFValue(5)}} text='Camera' onPress={()=>this.launchCam(true)} OPstyle={{backgroundColor:'none',borderColor:'#29cfb0',textColor:'#29cfb0',borderTopRightRadius:10}} color='#29cfb0' rippleColor='#29cfb033' disabled={false}/>
                                                    </Row>
                                                    <Row>
                                                        <DashboardButton style={{padding:RFValue(5)}} text='Search' onPress={this.findImage} OPstyle={{backgroundColor:'none',borderColor:'#49A8FF',borderBottomLeftRadius:10}} color='#49A8FF' rippleColor='#49A8FF33' disabled={false}/>
                                                        <DashboardButton style={{padding:RFValue(5)}} text='Cancel' onPress={this.cancl} OPstyle={{backgroundColor:'none',borderColor:'#49A8FF',borderBottomRightRadius:10}} color='#49A8FF' rippleColor='#49A8FF33' disabled={false}/>
                                                    </Row>
                                                </View>
                                        </View>
                                        <Overlay visible={this.state.optionInUse} overlayStyle={{backgroundColor:Theme.backgroundColor,borderRadius:15}} onBackdropPress={()=>this.launchOptions(false)}>
                                            <View style={{padding:15}}>
                                                <List.Subheader style={{color:Theme.color,fontSize:RFValue(25),flexDirection:'row'}}><Icon name='setting' style={{color:Theme.color,fontSize:26}} /><Icon name='plus' style={{color:Theme.backgroundColor,fontSize:RFValue(23)}} />Settings</List.Subheader>
                                                    <Divider style={[styles.devdColor,{marginBottom:RFValue(10)}]}/>
                                                <List.Item title="Language Settings" left={()=><Icon style={{color:Theme.color,fontSize:RFValue(23),alignSelf:'center'}} name='idcard'/>} right={()=><View><Text style={{color:Theme.backgroundColor,padding:3,backgroundColor:'#49c1c9',borderRadius:3,fontWeight:'bold'}}>Soon</Text></View>} titleStyle={{color:Theme.color,fontSize:RFValue(20)}}/>
                                                    <Divider style={styles.devdColor}/>
                                                <List.Item style={[styles.list,{paddingVertical:20}]} title="Dark Theme" titleStyle={{color:Theme.color,fontSize:RFValue(20)}} left={()=><Icon style={{color:Theme.color,fontSize:RFValue(23),alignSelf:'center'}} name='skin'/>} right={()=>{return <Switch value={this.state.theme} color='#49c1c9' onValueChange={val=>this.changeVal(val)}/>}} />
                                            </View>
                                        </Overlay>
                                        <Overlay visible={this.state.settingInUse} overlayStyle={{backgroundColor:Theme.backgroundColor,borderRadius:15,width:display.width-40}} onBackdropPress={()=>this.launchSettings(false)}>
                                            <List.Subheader style={{color:Theme.color,fontSize:24,flexDirection:'row'}}><Icon name='setting' style={{color:Theme.color,fontSize:26}} /><Icon name='plus' style={{color:Theme.backgroundColor,fontSize:24}} />More</List.Subheader>
                                            <Divider style={[styles.devdColor,{marginBottom:RFValue(14)}]}/>
                                            <View style={{marginBottom:RFValue(10)}}>
                                                <Row>
                                                    <SettingsButtonHandler cntstyle={{padding:RFValue(3)}} noIcon={true} text='Rate App' onPress={()=>Linking.openURL('market://details?id=')} rippleColor='#29cfb033' style={{textColor:'#29cfb0',borderColor:'#29cfb0',borderTopLeftRadius:10}}/>
                                                    <SettingsButtonHandler cntstyle={{padding:RFValue(3)}} noIcon={true} text='Report Bug' onPress={()=>this.launchModal(true)} rippleColor='#29cfb033' style={{textColor:'#29cfb0',borderColor:'#29cfb0',borderTopRightRadius:10}}/>
                                                </Row>
                                                <Row>
                                                    <SettingsButtonHandler cntstyle={{padding:RFValue(3)}} noIcon={true} text='Discord' onPress={()=>Linking.openURL('https://discord.gg/AV73XSXq2m')} rippleColor='#29cfb033' style={{textColor:'#29cfb0',borderColor:'#29cfb0'}}/>
                                                    <SettingsButtonHandler cntstyle={{padding:RFValue(3)}} noIcon={true} text='YouTube' onPress={()=>Linking.openURL('https://www.youtube.com/channel/UCIJF8t1WzTWG8RbYpz9rzTA')} rippleColor='#29cfb033' style={{textColor:'#29cfb0',borderColor:'#29cfb0'}}/>
                                                </Row>
                                                <Row>
                                                    <SettingsButtonHandler cntstyle={{padding:RFValue(3)}} noIcon={false} text='Info' icon='infocirlceo' style={{backgroundColor:'none',borderColor:'#49A8FF',textColor:'#49A8FF',borderBottomLeftRadius:10}} onPress={this.launchInfo} rippleColor='#49A8FF33'/>
                                                    <SettingsButtonHandler cntstyle={{padding:RFValue(3)}} noIcon={false} text='Share' icon='sharealt' style={{backgroundColor:'none',borderColor:'#49A8FF',textColor:'#49A8FF',borderBottomRightRadius:10}} onPress={this.onShare} rippleColor='#49A8FF33'/>
                                                </Row>
                                            </View>
                                            <Overlay isVisible={this.state.modal} overlayStyle={{backgroundColor:Theme.backgroundColor,borderRadius:15,paddingHorizontal:30,paddingBottom:15}} onBackdropPress={()=>this.launchModal(false)}>
                                                <List.Subheader style={{color:Theme.color,fontSize:24,flexDirection:'row'}}><Icon name='flag' style={{color:Theme.color,fontSize:26}} /><Icon name='plus' style={{color:Theme.backgroundColor,fontSize:24}} />Report Bugs</List.Subheader>
                                                <Divider style={[styles.devdColor,{marginBottom:RFValue(14),marginTop:RFValue(4)}]}/>
                                                <View style={{marginBottom:RFValue(10)}}>
                                                    <OverlayButton text='Report By E-mail' rippleColor='#29cfb033' ctnstyle={{padding:RFValue(3)}} style={{borderColor:'#29cfb0',textColor:'#29cfb0', borderTopLeftRadius:10,borderTopRightRadius:10}} onPress={()=>Linking.openURL('mailto:suportwithfindbyimage@gmail.com')}/>
                                                    <OverlayButton text='Report on Website' rippleColor='#29cfb033' ctnstyle={{padding:RFValue(3)}} style={{borderColor:'#29cfb0',textColor:'#29cfb0'}} onPress={()=>Linking.openURL('')}/>
                                                    <OverlayButton text='Report through Forms' rippleColor='#29cfb033' ctnstyle={{padding:RFValue(3)}} style={{borderColor:'#29cfb0',textColor:'#29cfb0', borderBottomLeftRadius:10,borderBottomRightRadius:10}} onPress={()=>Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSfQVCMXh69LA1WIaWB2fMjeVJ1T5rnPbKj58YYON_74AeIyPg/viewform')}/>
                                                </View>
                                            </Overlay>
                                        </Overlay>
                                </View>
                            }
                        </Provider>
                    </SafeAreaProvider>
                );
            } else {
                if (this.state.hasCameraPremission) {
                    return (
                        <SafeAreaProvider>
                                <Header backgroundColor='#3b9ca3' containerStyle={{zIndex:69}}>
                                    <CustomIcon onPress={()=>this.launchCam(false)} name='arrowleft' rotate={0}/>
                                    <View/>
                                    <View/>
                                </Header>
                                {this.state.loading?
                                    <FullScreenLoader text='Loading Theme' color={Theme.color} backgroundColor={Theme.backgroundColor}/>
                                    :
                                    <View style={[styles.container,{backgroundColor:'#222222'}]}>
                                        <Camera style={[styles.camera]} autoFocus={this.state.autoFocus} type={this.state.camMode} ratio={1} flashMode={this.state.flash} ref={refrence=>this.camera=refrence} onCameraReady={()=>this.camState(true)} zoom={this.state.zoom} whiteBalance={this.state.whiteBlcProps}>
                                            {this.state.imageLoading?<View/>:<Icon name='plus' style={{transform:[{scale:1+(this.state.zoom)}],position:'absolute',color:'#ffffff',fontSize:RFValue(18), opacity:0.75}}/>}
                                            {this.state.imageLoading?<SurfaceLoader/>:<View/>}
                                            {this.state.cameraReady?
                                                <View>
                                                    <View style={{position:'absolute',padding:7,backgroundColor:'#00000058',borderRadius:5,top:display.height/8,paddingLeft:20}}>
                                                        <TouchableOpacity style={{margin:7}} onPress={()=>this.toogleFlash()}><Icon name='bulb1' style={this.state.flash===Camera.Constants.FlashMode.on?[styles.flash,{color:'#ffef00'}]:styles.flash} /></TouchableOpacity>
                                                        <TouchableOpacity style={{margin:7}} onPress={()=>this.toogleAutoFocus()}><Icon name='scan1' style={this.state.autoFocus===Camera.Constants.AutoFocus.on?[styles.flash,{color:'#ffef00'}]:styles.flash} /></TouchableOpacity>
                                                        <Text style={{color:'#ffffff',fontSize:RFValue(19),alignSelf:'center'}}>{(Math.round((this.state.zoom)*100)/10)+1}x</Text>
                                                    </View>
                                                    <View style={styles.dash}>
                                                        <View style={{width:display.width-display.width/6,justifyContent:'center',alignItems:'center',justifyContent:'space-around',alignSelf:'center',marginTop:10,transform:[{scale:1.2}]}}>
                                                            <Slider minimumTrackTintColor='#3b9ca3' maximumTrackTintColor='#ffffff88' thumbTintColor='#3b9ca3' style={{width:display.width-display.width/4}} value={this.state.zoom} onValueChange={val=>this.setState({zoom:val})} minimumValue={0} maximumValue={0.9} step={0.01}/>
                                                        </View>
                                                        <View style={{justifyContent:'space-evenly',alignItems:'center',alignContent:'center',flexDirection:'row',paddingHorizontal:50}}>
                                                            <TouchableOpacity onPress={this.toogleCam}><Icon name='retweet' style={styles.cambtnoth}/></TouchableOpacity>
                                                            <TouchableOpacity onPress={this.takeASnap}><Icon name='camera' style={styles.camerabtn}/></TouchableOpacity>
                                                            <TouchableOpacity onPress={()=>this.launchCam(false)}><Icon name='close' style={styles.cambtnoth}/></TouchableOpacity>
                                                        </View>   
                                                    </View>
                                                </View>
                                            :
                                                <FullScreenLoader text='Loading Camera' color={Theme.color} backgroundColor={Theme.backgroundColor}/>
                                            }
                                        </Camera>
                                    </View>
                                    }
                        </SafeAreaProvider>
                    );
                } else {
                    return (
                        <SafeAreaProvider>
                            <Header backgroundColor='#3b9ca3' containerStyle={{zIndex:69}}>
                                <CustomIcon onPress={()=>this.launchCam(false)} name='arrowleft' rotate={0}/>
                                <Text style={styles.headingStyle}>Find-By-Image</Text>
                                <View/>
                            </Header>
                            <View style={[styles.container,{backgroundColor:Theme.backgroundColor}]}>
                                <List.Subheader style={{color:Theme.color,fontSize:RFValue(25)}}>No Camera Permission</List.Subheader>
                                <List.Subheader style={{color:Theme.color,fontSize:RFValue(18)}}>Please Grant Permission to continue</List.Subheader>
                                    <Divider style={[styles.devdColor,{width:RFValue(325),marginBottom:15,}]}/>
                                <OpButton text='Grant Camera Permission' rippleColor='#49A8FF33' style={{borderColor:'#49A8FF',textColor:'#49A8FF'}} onPress={()=> this.getCameraPermissions()}/>
                                <OpButton text='Deny Camera Permission' rippleColor='#49A8FF33' style={{borderColor:'#49A8FF',textColor:'#49A8FF'}} onPress={()=> this.launchCam(false)}/>
                                    <Divider style={[styles.devdColor,{width:RFValue(325),marginTop:15}]}/>
                            </View>
                        </SafeAreaProvider>
                    );
                }
            }
        }
    }
}
const styles = StyleSheet.create({
    headingStyle:{
        fontSize:RFValue(30),
        color:'#ffffff',
        letterSpacing:-2,
        alignSelf:'center'
    },
    container:{
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        flex:1,
        width:display.width,
    },
    camera:{
        width:RFValue(500),
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        flex:1,
    },
    per:{
        padding:10,
        margin:10,
        backgroundColor:'#4cc8e7',
        borderRadius:5,
        letterSpacing:-1
    },
    camerabtn:{
        fontSize:RFValue(60),
        color:'#ffffff',
        backgroundColor:'#47bac263',
        padding:RFValue(10),
        borderRadius:500,
        marginBottom:5,
        marginHorizontal:RFValue(25),
        marginTop:5
    },
    dash:{
        backgroundColor:'#00000058',
        width:display.width+30,
        top:display.height/2-RFValue(85),
        paddingBottom:RFValue(7)
    },
    cambtnoth:{
        fontSize:RFValue(45),
        color:'#ffffff',
        backgroundColor:'#47bac263',
        padding:RFValue(10),
        borderRadius:100
    },
    txt1:{
        alignSelf:'center',
        fontSize:RFValue(25),
        letterSpacing:-2
    },
    list:{
        padding:10,
        width:display.width-70,
    },
    titleS:{
        fontSize:RFValue(3),
        letterSpacing:-1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
    },
    devdColor:{
        backgroundColor:'#88888833',
        borderWidth:1,
        borderColor:'#88888833',
    },
    flash:{
        color:'#ffffffdd',
        fontSize:RFValue(25),
    },
});