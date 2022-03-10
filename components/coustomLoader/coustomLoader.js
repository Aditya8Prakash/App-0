import React from 'react';
import {ActivityIndicator} from 'react-native-paper';
const CoustomLoader=({color})=>{return <ActivityIndicator size='large' animated={true} style={{transform:[{scale:1.3}]}} color={color}/>}
export default CoustomLoader;