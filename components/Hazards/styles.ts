import { StyleSheet } from 'react-native';

export const formStyles = StyleSheet.create({
  container: {
    gap: 16
  },
  inputGroup: {
    gap: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  disabledButton: {
    opacity: 0.5
  }
});

export const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)'
  },
  closeButton: {
    padding: 4
  },
  placeholder: {
    width: 24
  },
  scrollView: {
    width: '100%'
  },
  scrollContent: {
    padding: 20
  },
  optionsContainer: {
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20
  },
  optionButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: '600'
  },
  headerTitle: {

    fontSize: 20,

    fontWeight: 'bold',

    textAlign: 'center',

  },
});