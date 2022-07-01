// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { approveDecryptPassword, cancelDecryptRequest } from '@polkadot/extension-ui/messaging';

import { ActionBar, ActionContext, Address, Button, ButtonArea, DecryptReqContext, InputWithLabel, Link, Loading, VerticalSpace, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { Header } from '../../partials';
import Bytes from '../Signing/Bytes';
import TransactionIndex from '../Signing/TransactionIndex';

const Buttons = styled(ButtonArea)`
  flex-direction: column;
  padding: 6px 24px;

  .cancelButton {
    margin-top: 4px;
    margin-bottom: 4px;
    text-decoration: underline;

    a {
      margin: auto;
    }
  }
`;

export default function Decrypt (): React.ReactElement {
  const { t } = useTranslation();
  const action = useContext(ActionContext);
  const requests = useContext(DecryptReqContext);
  const [requestIndex, setRequestIndex] = useState(0);

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const _onChangePassword = useCallback(
    (password: string): void => {
      setPassword(password);
      setError(null);
    },
    [setError, setPassword]
  );

  const _onNextClick = useCallback(
    () => setRequestIndex((requestIndex) => requestIndex + 1),
    []
  );

  const _onPreviousClick = useCallback(
    () => setRequestIndex((requestIndex) => requestIndex - 1),
    []
  );

  useEffect(() => {
    setRequestIndex(
      (requestIndex) => requestIndex < requests.length
        ? requestIndex
        : requests.length - 1
    );
  }, [requests]);

  // protect against removal overflows/underflows
  const request = requests.length !== 0
    ? requestIndex >= 0
      ? requestIndex < requests.length
        ? requests[requestIndex]
        : requests[requests.length - 1]
      : requests[0]
    : null;

  const cancel = useCallback(() => {
    if (request) {
      cancelDecryptRequest(request.id).then(() => action()).catch(console.error);
    }
  }, [request, action]);

  const decrypt = useCallback(async () => {
    if (request) {
      setIsBusy(true);

      try {
        await approveDecryptPassword(request.id, false, password);
        action();
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        }

        console.error(e);
      }

      setIsBusy(false);
    }
  }, [action, request, password]);

  return request
    ? (
      <>
        <Header text={ t<string>('Decrypt message')}>
          {requests.length > 1 && (
            <TransactionIndex
              index={requestIndex}
              onNextClick={_onNextClick}
              onPreviousClick={_onPreviousClick}
              totalItems={requests.length}
            />
          )}
        </Header>
        <div>
          <Address address={request.request.payload.address} />
        </div>
        <Bytes
          bytes={request.request.payload.data}
          url={request.url}
        />
        <div>
          <Address address={request.request.payload.sender} />
        </div>
        <VerticalSpace />
        <Buttons>
          <InputWithLabel
            disabled={isBusy}
            isError={!password || !!error}
            isFocused
            label={t<string>('Password for this account')}
            onChange={_onChangePassword}
            onEnter={decrypt}
            type='password'
            value={password}
            withoutMargin={true}
          />
          <div>
            {error &&
              <Warning
                isBelowInput
                isDanger
              >
                {error}
              </Warning>
            }
          </div>
          <Button
            isBusy={isBusy}
            isDisabled={!password || !!error}
            onClick={decrypt}
          >
            {t<string>('Decrypt')}
          </Button>
          <ActionBar className='cancelButton'>
            <Link
              isDanger
              onClick={cancel}
            >{t<string>('Cancel')}</Link>
          </ActionBar>
        </Buttons>
      </>
    )
    : <Loading />;
}
