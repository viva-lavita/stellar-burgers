import React, { ComponentType, ReactElement, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TModalProps } from '../components/modal/type';
import { Modal } from '../components/modal/modal';

interface WrappedComponentProps {}

interface WithReturnOnCloseModalProps extends Pick<TModalProps, 'title'> {}

type EnhancedProps<P> = P &
  WithReturnOnCloseModalProps & {
    children?: ReactNode;
  };

export function withReturnOnCloseModal<P extends WrappedComponentProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<EnhancedProps<P>> {
  return function WithReturnOnCloseModal(
    props: EnhancedProps<P>
  ): ReactElement {
    const { title, ...restProps } = props;
    const navigate = useNavigate();
    const location = useLocation();

    // рендерим компонент без модального окна при переходе по прямой ссылке
    if (location.key === 'default') {
      return <WrappedComponent {...(restProps as P)} />;
    }
    // или еще вариант:
    const backgroundLocation = location.state?.background;
    if (!backgroundLocation) {
      return <WrappedComponent {...(restProps as P)} />;
    }
    // но тут лишние параметры, от которых в целом наверно можно избавиться вообще

    const onClose = () => {
      navigate(-1);
    };

    return (
      <Modal onClose={onClose} title={title}>
        <WrappedComponent {...(restProps as P)} />
      </Modal>
    );
  };
}
