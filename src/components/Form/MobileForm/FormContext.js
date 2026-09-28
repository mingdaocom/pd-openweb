import { createContext, useContext } from 'react';

export const FormEmSizeContext = createContext(16);

export const useFormEmSize = () => useContext(FormEmSizeContext);
