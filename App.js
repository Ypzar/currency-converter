import React, { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import ModalDropdown from "react-native-modal-dropdown";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./styles";

const App = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("Please select...");
  const [toCurrencies, setToCurrencies] = useState([
    "Please select...",
    "Please select...",
    "Please select...",
  ]);
  const [currencies, setCurrencies] = useState([]);
  const [convertedAmounts, setConvertedAmounts] = useState({});
  const [isConverted, setIsConverted] = useState(false);

  const [toCurrencyDefaultIndices, setToCurrencyDefaultIndices] = useState([]);
  const [dropdownKey, setDropdownKey] = useState(0);

  useEffect(() => {
    if (isConverted) {
      setToCurrencies([
        "Please select...",
        "Please select...",
        "Please select...",
      ]);
      setToCurrencyDefaultIndices(new Array(toCurrencies.length).fill(0));
    }
  }, [isConverted]);

  useEffect(() => {
    // Initialize default indices for toCurrencies
    const defaultIndices = new Array(toCurrencies.length).fill(0);
    setToCurrencyDefaultIndices(defaultIndices);
  }, [toCurrencies]);

  const convertCurrency = useCallback(() => {
    if (!amount) {
      return;
    }
    fetch(
      `https://v6.exchangerate-api.com/v6/1303900274880e82fd128030/latest/${fromCurrency}`
    )
      .then((response) => response.json())
      .then((data) => {
        const exchangeRates = data.conversion_rates;
        const newConvertedAmounts = {};
        toCurrencies.forEach((currency) => {
          const conversionRate = exchangeRates[currency];
          if (conversionRate) {
            const result = parseFloat(amount) * conversionRate;
            newConvertedAmounts[currency] = result.toFixed(2);
          }
        });
        setConvertedAmounts(newConvertedAmounts);
        setIsConverted(true);
      })
      .catch((error) => {
        console.error("Error converting currency: ", error);
      });
  }, [amount, fromCurrency, toCurrencies]);

  useEffect(() => {
    fetch(
      `https://v6.exchangerate-api.com/v6/1303900274880e82fd128030/latest/USD`
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        const currencyList = Object.keys(data.conversion_rates);
        setCurrencies(currencyList);
      })
      .catch((error) => {
        console.error("Error fetching currency data: ", error);
      });
  }, []);

  const handleConvertButtonPress = () => {
    if (!isConverted) {
      convertCurrency();
    } else {
      // Clear all states and reset to default
      setAmount("");
      setFromCurrency("Please select...");
      setConvertedAmounts({});
      setIsConverted(false);

      setToCurrencies([
        "Please select...",
        "Please select...",
        "Please select...",
      ]);
      const defaultIndices = new Array(toCurrencies.length).fill(0);
      setToCurrencyDefaultIndices(defaultIndices);
      setDropdownKey((prevKey) => prevKey + 1);
    }
  };

  const handleToCurrencyChange = (index, value) => {
    const updatedToCurrencies = [...toCurrencies];
    updatedToCurrencies[index] = value;
    setToCurrencies(updatedToCurrencies);

    const updatedDefaultIndices = [...toCurrencyDefaultIndices];
    updatedDefaultIndices[index] = currencies.indexOf(value);
    setToCurrencyDefaultIndices(updatedDefaultIndices);
  };

  const buttonText = isConverted ? "Clear" : "Convert";

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />
      <View style={styles.subContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Currency Converter</Text>
          <MaterialIcons name="currency-exchange" size={36} color="#004b23" />
        </View>
        <Text style={styles.label}>Amount:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(text) => setAmount(text)}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.label}>From Currency:</Text>
        <View style={styles.inputContainer}>
          <ModalDropdown
            key={`dropdown-${dropdownKey}`}
            style={styles.dropdown}
            dropdownStyle={styles.dropdownContainer}
            dropdownTextStyle={styles.dropdownText}
            options={currencies}
            defaultValue={isConverted ? "Please select..." : fromCurrency}
            onSelect={(index, value) => setFromCurrency(value)}
            defaultIndex={0}
            renderSeparator={() => (
              <View
                style={{
                  height: 0.5,
                  backgroundColor: "#333",
                }}
              />
            )}
          />
        </View>

        <Text style={styles.label}>To Currencies:</Text>
        {toCurrencies.map((toCurrency, index) => (
          <View key={index} style={styles.inputContainer}>
            <ModalDropdown
              key={`dropdown-${index}-${dropdownKey}`}
              style={styles.dropdown}
              dropdownStyle={styles.dropdownContainer}
              dropdownTextStyle={styles.dropdownText}
              options={currencies}
              onSelect={(selectedIndex, selectedValue) => {
                handleToCurrencyChange(index, selectedValue);
              }}
              defaultValue={isConverted ? "Please select..." : toCurrency}
              defaultIndex={0}
              renderSeparator={() => (
                <View
                  style={{
                    height: 0.5,
                    backgroundColor: "#333",
                  }}
                />
              )}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.convertButton}
          onPress={handleConvertButtonPress}
        >
          <Text style={styles.convertButtonText}>{buttonText}</Text>
        </TouchableOpacity>

        {isConverted && (
          <View>
            {Object.entries(convertedAmounts).map(
              ([currency, convertedAmount]) => (
                <Text key={currency} style={styles.result}>
                  {amount} {fromCurrency} is {convertedAmount} {currency}
                </Text>
              )
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default App;
