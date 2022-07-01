// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@polkadot/keyring/types';
import type { HexString } from '@polkadot/util/types';
import type { EncryptPayload } from '../page/Signer';

import { wrapBytes } from '@polkadot/extension-dapp/wrapBytes';
import { TypeRegistry } from '@polkadot/types';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

export default class RequestBytesEncrypt {
  public readonly payload: EncryptPayload;

  constructor (payload: EncryptPayload) {
    this.payload = payload;
  }

  encrypt (_registry: TypeRegistry, pair: KeyringPair): { encrypted: HexString } {
    return {
      encrypted: u8aToHex(
        pair.encryptMessage(
          wrapBytes(this.payload.data),
          decodeAddress(this.payload.recipient) // TODO fails on 4c388c1b04512ee6dd3afd3355fe0498f55c57773d1f4862bdf6aa27d12e387f
        )
      )
    };
  }
}
