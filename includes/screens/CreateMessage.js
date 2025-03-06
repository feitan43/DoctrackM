import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
} from "react-native";

const CreateMessage = ({ navigation }) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    console.log("Sending message:", message);
  };

  return (
    <SafeAreaView style={styles.container}>
     <View>
      <Text>Create Message</Text>
     </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "skyblue",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: "100%",
    minHeight: 100,
  },
});

export default CreateMessage;
