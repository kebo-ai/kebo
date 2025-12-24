import logger from "../utils/logger";
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import tw from 'twrnc';
import { colors } from '../../theme/colors';
import { useReviewModal } from '../../hooks/useReviewModal';
import CustomModalReview from './CustomModalReview';

export const ReviewModalTest: React.FC = () => {
  const {
    isVisible,
    checkEligibility,
    closeModal,
    handleConfirm,
    handleCancel,
    getModalTexts,
    isLoading,
  } = useReviewModal();

  const handleTestModal = async () => {
    logger.debug('Probando modal de review...');
    const result = await checkEligibility();
    logger.debug('Resultado:', result);
  };

  const modalTexts = getModalTexts();

  return (
    <View style={tw`p-4`}>
      <TouchableOpacity
        style={tw`bg-[${colors.primary}] p-4 rounded-lg mb-4`}
        onPress={handleTestModal}
        disabled={isLoading}
      >
        <Text style={tw`text-white text-center font-bold`}>
          {isLoading ? 'Verificando...' : 'Probar Modal de Review'}
        </Text>
      </TouchableOpacity>

      <Text style={tw`text-gray-600 text-sm text-center`}>
        Este botón prueba la verificación de elegibilidad del modal de review.
      </Text>

      <CustomModalReview
        visible={isVisible}
        title={modalTexts.title}
        message={modalTexts.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={modalTexts.confirmText}
        cancelText={modalTexts.cancelText}
      />
    </View>
  );
};
