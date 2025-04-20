import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log('🧨 Error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Something went wrong 🥹</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
          <Text style={styles.errorMessage}>{this.state.error?.stack}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'yellow',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: 'white',
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
