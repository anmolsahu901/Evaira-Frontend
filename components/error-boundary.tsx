// filepath: components/error-boundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleReport = () => {
        Alert.alert('Report Sent', 'Thank you for helping us improve!');
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.emoji}>😔</Text>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            We're sorry, but something unexpected happened. Please try again.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={this.handleReset}
                            >
                                <Text style={styles.primaryButtonText}>Try Again</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={this.handleReport}
                            >
                                <Text style={styles.secondaryButtonText}>Report Issue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 320,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#000000',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        width: '100%',
    },
    secondaryButtonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default ErrorBoundary;