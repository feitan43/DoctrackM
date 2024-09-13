import { CommonActions } from '@react-navigation/native';

let navigatorRef;

function setTopLevelNavigator(ref) {
  navigatorRef = ref;
}

function navigate(name, params) {
  navigatorRef.dispatch(CommonActions.navigate(name, params));
}

function goBack() {
  navigatorRef.dispatch(CommonActions.goBack());
}


export default {
  setTopLevelNavigator,
  navigate,
  goBack,
};