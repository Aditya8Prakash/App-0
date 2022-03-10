import React from 'react';
import {Surface} from 'react-native-paper';
import {RFValue} from 'react-native-responsive-fontsize';
import CoustomLoader from './coustomLoader';
const SurfaceLoader = () => {return <Surface style={{backgroundColor:'#00000050',position:'absolute',padding:RFValue(45),borderRadius:15}}><CoustomLoader color='#ffffffaa'/></Surface>}
export default SurfaceLoader;