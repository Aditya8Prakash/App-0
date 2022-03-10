import React from 'react';
import {View,StyleSheet,KeyboardAvoidingView,ImageBackground,Alert,Dimensions,AsyncStorage,Animated} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FullScreenLoader from '../components/coustomLoader/fullScreenLoader'
import {Divider} from 'react-native-paper';
import db from '../config';
import firebase from 'firebase';
import CustomButton from '../components/login/coustomButton';
import CustomInput from '../components/login/coustomInput';
import {RFValue} from "react-native-responsive-fontsize";
var display = {width: Dimensions.get('window').width,height: Dimensions.get('window').height};
export default class LoginScreen extends React.Component {
    constructor () {
        super();
        this.state = {
            password:'',
            email:'',
            login:false,
            loading:true,
        }
        this.animative = {
            form:{
                opacity: new Animated.Value(0),
                PosY: new Animated.Value(225)
            },
            logo :{
                PosY:new Animated.Value(125),
            }
        }
    }
    AnimateUI=()=>{
        Animated.timing(this.animative.logo.PosY, {toValue: 0,duration: 550,useNativeDriver:true}).start();
        setTimeout(() => {
            Animated.timing(this.animative.form.opacity, {toValue: 1,duration: 650,useNativeDriver:true}).start();
            Animated.timing(this.animative.form.PosY, {toValue: 0,duration: 475,useNativeDriver:true}).start();
        }, 575);
    }
    storeData = async () => {try {await AsyncStorage.multiSet([['email',this.state.email],['password',this.state.password]])} catch (error) {Alert.alert(error);}}
    autoLogin = async () => {
        try {const value = await AsyncStorage.getItem('password');if (value !== null) {this.setState({password:value})}} catch (error) {Alert.alert(error)};
        try {const value = await AsyncStorage.getItem('email');if (value !== null) {this.setState({email:value})}} catch (error) {Alert.alert(error);}
        if (this.state.email) {firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(responce=>{this.props.navigation.navigate('SearchScreen')}).catch()}
    }
    handleError=error=>this.setState({login:false},()=>{return alert('Error : '+error)});
    userLogin=(username, password)=>this.setState({login:true},()=>firebase.auth().signInWithEmailAndPassword(username, password).then(responce=>{this.storeData();this.props.navigation.navigate('SearchScreen')}).catch(error=>this.handleError(error)));
    userSignUp=(username, password)=>firebase.auth().createUserWithEmailAndPassword(username, password).then(responce=>Alert.alert('Signup Success! \n Just tap on login button')).catch(error=>{return Alert.alert('Error Code :'+error.code+' '+error.message)});
    componentDidMount(){
        this.autoLogin();
        setTimeout(()=>this.setState({loading:false},()=>{ setTimeout(()=>this.AnimateUI(),75)}),3000);
    }
    render() {
        if (!this.state.login) {
            return(
                <SafeAreaProvider>
                    <StatusBar style="light" />
                    <ImageBackground style = {styles.container} source={require('../assets/images/back2.png')}>
                        <View>
                            <Animated.View style={[styles.logo,{transform: [{translateY: this.animative.logo.PosY}]}]}>
                                <Animated.Image style={styles.img} source={require('../assets/images/front.png')}/>
                                <Animated.Text style={[styles.hed]}>Find-By-Image</Animated.Text>
                            </Animated.View>
                            <Animated.View style = {[styles.secContainer,{opacity:this.animative.form.opacity,transform: [{translateY: this.animative.form.PosY}]}]}>
                                <Animated.Text style={styles.textStyle}>Login / Sign Up</Animated.Text>
                                <KeyboardAvoidingView> 
                                    <CustomInput style={{borderTopLeftRadius:10,borderTopRightRadius:10, borderColor:'#00000022', borderWidth:3}} placeholder='E-mail' keyboardType='email-address' value={this.state.value} onChangeText={(txt)=>{this.setState({email:txt})}} secureTextEntry={false}/>
                                    <CustomInput style={{borderBottomLeftRadius:10,borderBottomRightRadius:10, borderColor:'#00000022', borderWidth:3}} placeholder='Password' keyboardType='default' value={this.state.value} onChangeText={(txt)=>{this.setState({password:txt})}} secureTextEntry={true}/>
                                </KeyboardAvoidingView>
                                    <Divider style={styles.devdColor}/>
                                <Animated.View style = {styles.btnContainer} >
                                    <CustomButton style={{borderTopLeftRadius:10,borderBottomLeftRadius:10, borderColor:'#00000022', borderWidth:3}} text='Login' onPress={()=>this.userLogin(this.state.email,this.state.password)} />
                                    <CustomButton style={{borderTopRightRadius:10,borderBottomRightRadius:10, borderColor:'#00000022', borderWidth:3}} text='SignUp' onPress={()=>this.userSignUp(this.state.email,this.state.password)} />
                                </Animated.View>
                            </Animated.View>
                        </View>
                    </ImageBackground>
                    {this.state.loading?<ImageBackground style = {styles.container1} source={require('../assets/splash.png')}/>:<View/>}
                </SafeAreaProvider>
            )} else {return <FullScreenLoader text='Please Wait Logging You in : )' color='#000000' backgroundColor='#ecfeff'/>}
    }
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    textStyle: {
        fontSize:RFValue(22),
        padding:2.5,
        fontWeight:'100',
        marginBottom:15,
        color:'#000000'
    },
    btnContainer:{
        flexDirection:'row',
        justifyContent:'center'
    },
    secContainer:{
        backgroundColor:'#00c3ff33',
        padding:15,
        borderRadius:20,
    },
    img:{
        width:display.width-250<200?display.width-200:250,
        height:display.width-250<200?display.width-200:250,
        alignSelf:'center',
    },
    hed:{
        fontSize:RFValue(37),
        alignSelf:'center',
        color:'#000000'
    },
    logo:{
        alignSelf:'center',
        margin:RFValue(30)
    },
    container1:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        backgroundColor:'#000000',
        height:display.height+100,
        width:display.width,
        position:'absolute'
    },
    txt:{
        fontSize:25,
        paddingVertical:75,
        color:'#000000'
    },
    devdColor:{
        backgroundColor:'#00000011',
        borderWidth:2,
        borderColor:'#00000011',
        marginVertical:RFValue(10),
        width:display.width-50<350 === true?display.width-50:350,
        alignSelf:'center',
        borderRadius:100
    },
});