import React, { Component } from 'react';
import {Dimensions,Image,ScrollView,Modal,View,SafeAreaView,TouchableOpacity,YellowBox} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import AutoHeightImage from 'react-native-auto-height-image';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { isIphoneX } from 'react-native-iphone-x-helper';
import ImageCropOverlay from './ImageCropOverlay';
import {RFValue} from 'react-native-responsive-fontsize';
const { width } = Dimensions.get('window');
YellowBox.ignoreWarnings(['componentWillReceiveProps', 'componentWillUpdate', 'componentWillMount']);
YellowBox.ignoreWarnings(['Warning: componentWillMount is deprecated','Warning: componentWillReceiveProps is deprecated','Module RCTImageLoader requires'])
class ExpoImageManipulator extends Component {
    constructor(props) {
        super(props);
        this.state = {cropMode: false,processing: false,zoomScale: 1,};
        this.scrollOffset = 0;
        this.currentPos = {left: 0,top: 0,};
        this.currentSize = {width: 0,height: 0,};
        this.maxSizes = {width: 0,height: 0,};
        this.actualSize = {width: 0,height: 0,};
    }
    async componentDidMount() {await this.onConvertImageToEditableSize()}
    onGetCorrectSizes = (w, h) => {
        const sizes = {convertedWidth: w,convertedheight: h,};
        const ratio = Math.min(1920 / w, 1080 / h);
        sizes.convertedWidth = Math.round(w * ratio);
        sizes.convertedheight = Math.round(h * ratio);
        return sizes;
    }
    async onConvertImageToEditableSize() {
        const { photo: { uri: rawUri } } = this.props;
        Image.getSize(rawUri, async (imgW, imgH) => {
            const { convertedWidth, convertedheight } = this.onGetCorrectSizes(imgW, imgH);
            const { uri, width: w, height } = await ImageManipulator.manipulateAsync(rawUri,[{resize: {width: convertedWidth,height: convertedheight,},},]);
            this.setState({uri,});
            this.actualSize.width = w;
            this.actualSize.height = height;
        });
    }
    get isRemote() {
        const { uri } = this.state;
        return /^(http|https|ftp)?(?:[:/]*)([a-z0-9.-]*)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(uri);
    }
    onToggleModal = () => {
        const { onToggleModal } = this.props;
        onToggleModal();
        this.setState({ cropMode: false });
    }
    onCropImage = () => {
        this.setState({ processing: true })
        const { uri } = this.state;
        Image.getSize(uri, async (actualWidth, actualHeight) => {
            const cropObj = this.getCropBounds(actualWidth, actualHeight);
            if (cropObj.height > 0 && cropObj.width > 0) {
                let uriToCrop = uri;
                if (this.isRemote) {
                    const response = await FileSystem.downloadAsync(uri,FileSystem.documentDirectory + 'image',);
                    uriToCrop = response.uri;
                }
                const {uri: uriCroped, base64, width: croppedWidth, height: croppedHeight,} = await this.crop(cropObj, uriToCrop);
                this.actualSize.width = croppedWidth
                this.actualSize.height = croppedHeight
                this.setState({uri: uriCroped, base64, cropMode: false, processing: false,});
            } else {
                this.setState({ cropMode: false, processing: false });
            }
        });
    }
    onRotateImage = async () => {
        const { uri } = this.state;
        let uriToCrop = uri;
        if (this.isRemote) {
            const response = await FileSystem.downloadAsync(uri,FileSystem.documentDirectory + 'image',);
            uriToCrop = response.uri;
        }
        Image.getSize(uri, async (width2, height2) => {
            const { uri: rotUri, base64 } = await this.rotate(uriToCrop, width2, height2);
            this.setState({ uri: rotUri, base64 });
        });
    }
    onFlipImage = async (orientation) => {
        const { uri } = this.state;
        let uriToCrop = uri;
        if (this.isRemote) {
            const response = await FileSystem.downloadAsync(uri,FileSystem.documentDirectory + 'image',);
            uriToCrop = response.uri;
        }
        Image.getSize(uri, async () => {
            const { uri: rotUri, base64 } = await this.filp(uriToCrop, orientation);
            this.setState({ uri: rotUri, base64 });
        });
    }
    onHandleScroll = event => this.scrollOffset = event.nativeEvent.contentOffset.y;
    getCropBounds = (actualWidth, actualHeight) => {
        const imageRatio = actualHeight / actualWidth;
        let originalHeight = Dimensions.get('window').height - 64;
        if (isIphoneX()) {originalHeight = Dimensions.get('window').height - 122};
        const renderedImageWidth = imageRatio < (originalHeight / width) ? width : originalHeight / imageRatio;
        const renderedImageHeight = imageRatio < (originalHeight / width) ? width * imageRatio : originalHeight;
        const renderedImageY = (originalHeight - renderedImageHeight) / 2.0;
        const renderedImageX = (width - renderedImageWidth) / 2.0;
        const renderImageObj = {left: renderedImageX,top: renderedImageY,width: renderedImageWidth,height: renderedImageHeight,};
        const cropOverlayObj = {left: this.currentPos.left,top: this.currentPos.top,width: this.currentSize.width,height: this.currentSize.height,};
        let intersectAreaObj = {};
        const x = Math.max(renderImageObj.left, cropOverlayObj.left);
        const num1 = Math.min(renderImageObj.left + renderImageObj.width, cropOverlayObj.left + cropOverlayObj.width);
        const y = Math.max(renderImageObj.top, cropOverlayObj.top);
        const num2 = Math.min(renderImageObj.top + renderImageObj.height, cropOverlayObj.top + cropOverlayObj.height);
        if (num1 >= x && num2 >= y) {
            intersectAreaObj = {originX: (x - renderedImageX) * (actualWidth / renderedImageWidth),originY: (y - renderedImageY) * (actualWidth / renderedImageWidth),width: (num1 - x) * (actualWidth / renderedImageWidth),height: (num2 - y) * (actualWidth / renderedImageWidth),};
        } else {
            intersectAreaObj = {originX: x - renderedImageX,originY: y - renderedImageY,width: 0,height: 0,};
        }
        return intersectAreaObj;
    }
    filp = async (uri, orientation) => {
        const { saveOptions } = this.props
        const manipResult = await ImageManipulator.manipulateAsync(uri, [{flip: orientation === 'vertical' ? ImageManipulator.FlipType.Vertical : ImageManipulator.FlipType.Horizontal,}],saveOptions);
        return manipResult;
    };
    rotate = async (uri, width2) => {
        const { saveOptions } = this.props;
        const manipResult = await ImageManipulator.manipulateAsync(uri, [{rotate: -90,}, {resize: {width: this.trueWidth || width2,},}], saveOptions);
        return manipResult;
    }
    crop = async (cropObj, uri) => {
        const { saveOptions } = this.props;
        if (cropObj.height > 0 && cropObj.width > 0) {
            const manipResult = await ImageManipulator.manipulateAsync(uri,[{crop: cropObj}],saveOptions,);
            return manipResult;
        }
        return {uri: null,base64: null}
    };
    async UNSAFE_componentWillReceiveProps() {await this.onConvertImageToEditableSize()}
    render() {
        const {isVisible,onPictureChoosed,borderColor,allowRotate = true,allowFlip = true,btnTexts,fixedMask,} = this.props;
        const {uri,base64,cropMode,processing,} = this.state;
        const imageRatio = this.actualSize.height / this.actualSize.width;
        let originalHeight = Dimensions.get('window').height - 64;
        if (isIphoneX()) {originalHeight = Dimensions.get('window').height - 122};
        const cropRatio = originalHeight / width;
        const cropWidth = imageRatio < cropRatio ? width : Dimensions.get('window').width-250 / imageRatio;
        const cropHeight = imageRatio < cropRatio ? width * imageRatio : originalHeight-250;
        const cropInitialTop = (originalHeight - cropHeight) / 2.0;
        const cropInitialLeft = (width - cropWidth) / 2.0;
        if (this.currentSize.width === 0 && cropMode) {
            this.currentSize.width = cropWidth;
            this.currentSize.height = cropHeight;
            this.currentPos.top = cropInitialTop;
            this.currentPos.left = cropInitialLeft;
        }
        return (
            <Modal animationType="slide" transparent visible={isVisible} hardwareAccelerated onRequestClose={() => { this.onToggleModal() }} >
                <SafeAreaView style={{ width, flexDirection: 'row', backgroundColor: '#3b9ca3', justifyContent: 'space-between' }} >
                    <ScrollView scrollEnabled={false} horizontal contentContainerStyle={{ width: '100%', paddingHorizontal: 15, height: RFValue(65), alignItems: 'center', }} >
                        {!cropMode
                            ? (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => this.onToggleModal()} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', }} >
                                        <Icon size={RFValue(33)} name="arrowleft" color="white" />
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <TouchableOpacity onPress={() => this.setState({ cropMode: true })} style={{ marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', }} >
                                            <Icon size={RFValue(30)} name="scan1" color="white" />
                                        </TouchableOpacity>
                                        { allowRotate && (
                                                <View style={{ flexDirection: 'row'}}>
                                                    <TouchableOpacity onPress={() => this.onRotateImage()} style={{ marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', }} >
                                                        <Icon style={{ transform: [{ rotate: '60deg' }] }} size={RFValue(30)} name="reload1" color="white" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => this.onFlipImage('vertical')} style={{ marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', }} >
                                                        <MaterialIcon style={{ transform: [{ rotate: '270deg' }] }} size={RFValue(30)} name="flip" color="white" />
                                                    </TouchableOpacity>
                                                </View>)}
                                        { allowFlip && (
                                            <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity onPress={() => this.onFlipImage('horizontal')} style={{ marginLeft: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', }} >
                                                    <MaterialIcon size={RFValue(30)} name="flip" color="white" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => { onPictureChoosed({ uri, base64 }); this.onToggleModal() }} style={{ marginLeft: 10, width: 60, height: 32, alignItems: 'center', justifyContent: 'center', }} >
                                                    <Icon size={RFValue(30)} name="check" color="white" />
                                                </TouchableOpacity>
                                            </View>)}
                                    </View>
                                </View>
                            )
                            : (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={() => this.setState({ cropMode: false })} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', }} >
                                        <Icon size={RFValue(30)} name="arrowleft" color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.onCropImage()} style={{ marginRight: 10, alignItems: 'flex-end', flex: 1, }} >
                                        <View style={{ flexDirection: 'row' }}>
                                            <Icon name='check' color="white" size={RFValue(30)} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </ScrollView>
                </SafeAreaView>
                <View style={{ flex: 1, backgroundColor: '#222222', width: Dimensions.get('window').width }}>
                    <ScrollView style={{ position: 'relative', flex: 1 }} maximumZoomScale={5} minimumZoomScale={0.5} onScroll={this.onHandleScroll} bounces={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} ref={(c) => { this.scrollView = c }} scrollEventThrottle={16} scrollEnabled={false} pinchGestureEnabled={false} >
                        <AutoHeightImage style={{height:RFValue(640)}} source={{ uri }} resizeMode={imageRatio >= 1 ? 'contain' : 'contain'} width={width} height={originalHeight} />
                        {!!cropMode && (<ImageCropOverlay onLayoutChanged={(top, left, w, height) => {this.currentSize.width = w;this.currentSize.height = height;this.currentPos.top = top;this.currentPos.left = left;}} initialWidth={(fixedMask && fixedMask.width) || cropWidth} initialHeight={(fixedMask && fixedMask.height) || cropHeight} initialTop={cropInitialTop} initialLeft={cropInitialLeft} minHeight={(fixedMask && fixedMask.height) || 100} minWidth={(fixedMask && fixedMask.width) || 100} borderColor={borderColor}/>)}
                    </ScrollView>
                </View>
            </Modal>
        )
    }
}
export default ExpoImageManipulator
ExpoImageManipulator.defaultProps = {
    onPictureChoosed: ({ uri, base64 }) => console.log('URI:', uri, base64),
    borderColor: '#a4a4a4',
    btnTexts: {crop: 'check',rotate: 'Rotate',done: 'Done',processing: 'Processing',},
    saveOptions: {compress: 1,format: ImageManipulator.SaveFormat.PNG,base64: false,},
    fixedMask: null,
}
ExpoImageManipulator.propTypes = {borderColor: PropTypes.string,isVisible: PropTypes.bool.isRequired,onPictureChoosed: PropTypes.func,btnTexts: PropTypes.object,fixedMask: PropTypes.object,saveOptions: PropTypes.object,photo: PropTypes.object.isRequired,onToggleModal: PropTypes.func.isRequired}
import React, { Component } from 'react';
import { View, PanResponder, Dimensions } from 'react-native';
class ImageCropOverlay extends React.Component {
    state = {draggingTL: false,draggingTM: false,draggingTR: false,draggingML: false,draggingMM: false,draggingMR: false,draggingBL: false,draggingBM: false,draggingBR: false,initialTop: this.props.initialTop,initialLeft: this.props.initialLeft,initialWidth: this.props.initialWidth,initialHeight: this.props.initialHeight,offsetTop: 0,offsetLeft: 0,};
    panResponder = {};
    UNSAFE_componentWillMount() {this.panResponder = PanResponder.create({onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,onPanResponderGrant: this.handlePanResponderGrant,onPanResponderMove: this.handlePanResponderMove,onPanResponderRelease: this.handlePanResponderEnd,onPanResponderTerminate: this.handlePanResponderEnd,});};
    render() {
        const {draggingTL, draggingTM, draggingTR, draggingML, draggingMM, draggingMR, draggingBL, draggingBM, draggingBR, initialTop, initialLeft, initialHeight, initialWidth, offsetTop, offsetLeft,} = this.state;
        const style = {};
        style.top = initialTop + ((draggingTL || draggingTM || draggingTR || draggingMM) ? offsetTop : 0);
        style.left = initialLeft + ((draggingTL || draggingML || draggingBL || draggingMM) ? offsetLeft : 0);
        style.width = initialWidth + ((draggingTL || draggingML || draggingBL) ? -offsetLeft : (draggingTM || draggingMM || draggingBM) ? 0 : offsetLeft);
        style.height = initialHeight + ((draggingTL || draggingTM || draggingTR) ? -offsetTop : (draggingML || draggingMM || draggingMR) ? 0 : offsetTop);
        if (style.width > this.props.initialWidth) {style.width = this.props.initialWidth};
        if (style.width < this.props.minWidth) {style.width = this.props.minWidth};
        if (style.height > this.props.initialHeight) {style.height = this.props.initialHeight};
        if (style.height < this.props.minHeight) {style.height = this.props.minHeight};
        const { borderColor } = this.props;
        return (
            <View {...this.panResponder.panHandlers}style={[{flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', borderStyle: 'solid', borderWidth: 2,borderRadius:5, borderColor, backgroundColor: '#77777733',}, style]}>
                <View style={{flexDirection: 'row', width: '100%', flex: 1 / 3, backgroundColor: 'transparent',}}>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingTL ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingTM ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingTR ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                </View>
                <View style={{flexDirection: 'row', width: '100%', flex: 1 / 3, backgroundColor: 'transparent',}}>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingML ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingMM ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingMR ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                </View>
                <View style={{flexDirection: 'row', width: '100%', flex: 1 / 3, backgroundColor: 'transparent',}}>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingBL ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingBM ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                    <View style={{borderColor, borderWidth: 0, backgroundColor: draggingBR ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',}}/>
                </View>
                <View style={{top: 0, left: 0, width: '100%', height: '100%', position: 'absolute'}}>
                    <View style={{ flex: 1 / 3, flexDirection: 'row' }}>
                        <View style={{flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid'}}>
                            <View style={{position: 'absolute', left: 5, top: 5, borderLeftWidth: 2, borderTopWidth: 2, height: 48, width: 48, borderColor: '#f4f4f4', borderStyle: 'solid'}}/>
                        </View>
                        <View style={{flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid'}}/>
                        <View style={{flex: 3, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',}}>
                            <View style={{position: 'absolute', right: 5, top: 5, borderRightWidth: 2, borderTopWidth: 2, height: 48, width: 48, borderColor: '#f4f4f4', borderStyle: 'solid'}}/>
                        </View>
                    </View>
                    <View style={{ flex: 1 / 3, flexDirection: 'row' }}>
                        <View style={{flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid'}}/>
                        <View style={{flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid'}}/>
                        <View style={{flex: 3, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',}}/>
                    </View>
                    <View style={{ flex: 1 / 3, flexDirection: 'row' }}>
                        <View style={{flex: 3, borderRightWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid', position: 'relative',}}>
                            <View style={{position: 'absolute', left: 5, bottom: 5, borderLeftWidth: 2, borderBottomWidth: 2, height: 48, width: 48, borderColor: '#f4f4f4', borderStyle: 'solid'}}/>
                        </View>
                        <View style={{flex: 3, borderRightWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',}}/>
                        <View style={{ flex: 3, position: 'relative' }}>
                            <View style={{position: 'absolute', right: 5, bottom: 5, borderRightWidth: 2, borderBottomWidth: 2, height: 48, width: 48, borderColor: '#f4f4f4', borderStyle: 'solid'}}/>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
    getTappedItem(x, y) {
        const {initialLeft, initialTop, initialWidth, initialHeight,} = this.state;
        const xPos = parseInt((x - initialLeft) / (initialWidth / 3));
        const yPos = parseInt((y - initialTop - 64) / (initialHeight / 3));
        const index = yPos * 3 + xPos;
        if (index == 0) {return 'tl'} if (index == 1) {return 'tm'} if (index == 2) {return 'tr'} if (index == 3) {return 'ml'} if (index == 4) {return 'mm'} if (index == 5) {return 'mr'} if (index == 6) {return 'bl'} if (index == 7) {return 'bm'} if (index == 8) {return 'br'};
        return '';
    }
    handleStartShouldSetPanResponder = event => true;
    handlePanResponderGrant = (event) => {
        const selectedItem = this.getTappedItem(event.nativeEvent.pageX, event.nativeEvent.pageY);
        if (selectedItem == 'tl') {this.setState({ draggingTL: true })} else if (selectedItem == 'tm') {this.setState({ draggingTM: true })} else if (selectedItem == 'tr') {this.setState({ draggingTR: true })} else if (selectedItem == 'ml') {this.setState({ draggingML: true })} else if (selectedItem == 'mm') {this.setState({ draggingMM: true })} else if (selectedItem == 'mr') {this.setState({ draggingMR: true })} else if (selectedItem == 'bl') {this.setState({ draggingBL: true })} else if (selectedItem == 'bm') {this.setState({ draggingBM: true })} else if (selectedItem == 'br') {this.setState({ draggingBR: true })}
    }
    handlePanResponderMove = (e, gestureState) => this.setState({offsetTop: gestureState.dy,offsetLeft: gestureState.dx});
    handlePanResponderEnd = (e, gestureState) => {
        const {initialTop, initialLeft, initialWidth, initialHeight, draggingTL, draggingTM, draggingTR, draggingML, draggingMM, draggingMR, draggingBL, draggingBM, draggingBR,} = this.state;
        const state = {draggingTL: false,draggingTM: false,draggingTR: false,draggingML: false,draggingMM: false,draggingMR: false,draggingBL: false,draggingBM: false,draggingBR: false,offsetTop: 0,offsetLeft: 0,};
        state.initialTop = initialTop + ((draggingTL || draggingTM || draggingTR || draggingMM) ? gestureState.dy : 0);
        state.initialLeft = initialLeft + ((draggingTL || draggingML || draggingBL || draggingMM) ? gestureState.dx : 0);
        state.initialWidth = initialWidth + ((draggingTL || draggingML || draggingBL) ? -gestureState.dx : (draggingTM || draggingMM || draggingBM) ? 0 : gestureState.dx);
        state.initialHeight = initialHeight + ((draggingTL || draggingTM || draggingTR) ? -gestureState.dy : (draggingML || draggingMM || draggingMR) ? 0 : gestureState.dy);
        if (state.initialWidth > this.props.initialWidth) {state.initialWidth = this.props.initialWidth};
        if (state.initialWidth < this.props.minWidth) {state.initialWidth = this.props.minWidth};
        if (state.initialHeight > this.props.initialHeight) {state.initialHeight = this.props.initialHeight};
        if (state.initialHeight < this.props.minHeight) {state.initialHeight = this.props.minHeight};
        this.setState(state);
        this.props.onLayoutChanged(state.initialTop, state.initialLeft, state.initialWidth, state.initialHeight);
    }
}
export default ImageCropOverlay;