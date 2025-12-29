import { FC } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useDispatch, useSelector } from '../../services/store';
import { useParams } from 'react-router-dom';

import { selectIngredients } from '@selectors';
import { getIngredients } from '../../services/slices/ingredient/ingredient-slice';

export const IngredientDetails: FC = () => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const { id } = useParams();

  if (!ingredients.length) {
    dispatch(getIngredients());
  }
  const ingredientData = ingredients.find((item) => item._id === id);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
