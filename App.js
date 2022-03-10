import React from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import LoginScreen from './screens/login';
import SearchScreen from './screens/search';
export default function App () {return <AppContainer/>}
const switchNavigator = createSwitchNavigator({LoginScreen:{screen: LoginScreen},SearchScreen:{screen: SearchScreen}});
const AppContainer=createAppContainer(switchNavigator);