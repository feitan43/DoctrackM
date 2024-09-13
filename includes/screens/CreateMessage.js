import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";

const CreateMessage = ({ navigation }) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    console.log("Sending message:", message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton
          onPress={() => navigation.goBack()}
          labelVisible={false} // Hide the back button label
        />
        <Text style={styles.headerTitle}>Create Message</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Type your message here"
        multiline
        value={message}
        onChangeText={(text) => setMessage(text)}
      />
      <Button
        title="Send"
        onPress={sendMessage}
        disabled={!message} // Disable the button if the message is empty
      />
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
