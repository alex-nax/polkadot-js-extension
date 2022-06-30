// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@polkadot/keyring/types';
import type { HexString } from '@polkadot/util/types';
import type { DecryptPayload } from '../page/Signer';

import { wrapBytes } from '@polkadot/extension-dapp/wrapBytes';
import { TypeRegistry } from '@polkadot/types';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

export default class RequestBytesDecrypt  {
  public readonly payload: DecryptPayload;

  constructor (payload: DecryptPayload) {
    this.payload = payload;
  }

  decrypt (_registry: TypeRegistry, pair: KeyringPair): { message: HexString } {
    return {
      message: u8aToHex(
        pair.decryptMessage(
          wrapBytes(this.payload.data),
          decodeAddress(this.payload.sender)
        )
      )
    };
  }
}
