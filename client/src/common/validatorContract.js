
import Web3 from 'web3';
let b3
let globalThis;
///var/lib/docker/overlay2/aa0284003811517692948768f733e6a782e445892ce7075594822d8bea4671e1/merged/usr/src/app/client/src/common/validatorContract.js/var/lib/docker/overlay2/aa0284003811517692948768f733e6a782e445892ce7075594822d8bea4671e1/merged/usr/src/app/client/src/common/validatorContract.js
class ValidatorContract {
  constructor(localWeb3, contractAbi, isLoaded) {
    this.web3 = localWeb3;
    this.validatorContractAbi = JSON.parse(contractAbi);
    this.validatorContractAddress = '0x0000000000000000000000000000000000000006';
    this.contractState = {};
    this.callbacks = [];
    this.SUBSCRIPTION_INTERVAL_IN_MS = 5000;

    this.contract = this.web3.eth
      .contract(this.validatorContractAbi)
      .at(this.validatorContractAddress);
    globalThis = this;

    this.GetCurrentAccount();
    this.StartStateSubscription();
  }

  StartStateSubscription() {
    setInterval(
      () => {
        globalThis.WatchState('GetProposedAdminsAsync');
        globalThis.WatchState('GetAdminsAsync');
        if (typeof globalThis.currentAccount !== 'undefined') {
          globalThis.WatchState('GetValidatorsForAdmin', globalThis.currentAccount);
        }
        globalThis.GetAdminsAsync().then((admins) => {
          admins.forEach((admin) => {
            globalThis.WatchState('GetAliasForAdmin', admin);
            globalThis.WatchState('GetVotesAgainstAdmin', admin);
          });
        });
        globalThis.GetProposedAdminsAsync().then((candidates) => {
          candidates.forEach((candidate) => {
            globalThis.WatchState('GetVotesForProposedAdmin', candidate);
          });
        });
        globalThis.WatchState('GetConsortiumName');
      },
      this.SUBSCRIPTION_INTERVAL_IN_MS,
    );
  }

  GetCurrentAccount() {
    this.web3.eth.getAccounts((error, accounts) => {
      [globalThis.currentAccount] = accounts;
    });
  }

  /*
    * Public facing functions for registering events
    */

  // Fires callback if there's an update to the candidate set
  RegisterCandidateSetSubscription(callback) {
    this.AddCallback('GetProposedAdminsAsync', callback);
  }

  // Fires callback if there's an update to the admin set
  RegisterAdminSetSubscription(callback) {
    this.AddCallback('GetAdminsAsync', callback);
  }

  // Fires callback if there's an update to this admin's validator set
  RegisterValidatorSetSubscription(callback) {
    this.AddCallback('GetValidatorsForAdmin', callback);
  }

  // Fires callback if there's an update to any of the admins' aliases
  RegisterAdminAliasSubscription(callback) {
    this.AddCallback('GetAliasForAdmin', callback);
  }

  RegisterVotesAgainstAdminSubscription(callback) {
    this.AddCallback('GetVotesAgainstAdmin', callback);
  }

  RegisterVotesForProposedAdminSubscription(callback) {
    this.AddCallback('GetVotesForProposedAdmin', callback);
  }

  RegisterConsortiumNameSubscription(callback) {
    this.AddCallback('GetConsortiumName', callback);
  }

  // Registers callback in set
  AddCallback(subscriptionName, callback) {
    if (typeof callback === 'undefined') {
      console.error('Cannot register subscription: ', subscriptionName, ': callback undefined');
      return;
    }
    if (typeof this.callbacks[subscriptionName] === 'undefined') {
      this.callbacks[subscriptionName] = [];
    }
    this.callbacks[subscriptionName].push(callback);
  }

  /*
     * Generic contract state watcher
     * Calls getter function with args
     * records the result in an array where the key is the getter name
     * if it detects a change from the last call, it fires all of the
     * registered callbacks for the given getter
     */
  WatchState(getter, args) {
    this[getter](args).then((currentState) => {
      let shouldCallback = false;
      const contractStateKey = `${getter}_${args}`;
      if (
        JSON.stringify(currentState) !== JSON.stringify(this.contractState[contractStateKey]) &&
        typeof this.contractState[contractStateKey] !== 'undefined'
      ) {
        console.log('getting here!!!!');
        shouldCallback = true;
      }
      this.contractState[contractStateKey] = currentState;
      if (shouldCallback && typeof globalThis.callbacks[getter] !== 'undefined') {
        globalThis.callbacks[getter].forEach((callback) => {
          callback(currentState);
        });
      }
    });
  }

  get ValidatorContractEthereum() {
    return this.contract;
  }

  GetValidatorCapacityAsync() {
console.log("capacity hya");
    return this.getData('getValidatorCapacity');
  }

  GetAdminsAsync() {
    return new Promise((resolve, reject) => {
      this.getData('getAdmins').then((result) => {
        const adminsList = [];
        result.forEach((eachElement) => {
          if (eachElement !== '0x0000000000000000000000000000000000000000') {
            adminsList.push(eachElement);
          }
        });
        resolve(adminsList);
      });
    });
  }

  GetProposedAdminsAsync() {
    return new Promise((resolve, reject) => {
      this.getData('getProposedAdmins').then((result) => {
        const adminsList = [];
        result.forEach((eachElement) => {
          if (eachElement !== '0x0000000000000000000000000000000000000000') {
            adminsList.push(eachElement);
          }
        });
        resolve(adminsList);
      });
    });
  }

  GetValidatorsForAdmin(adminAccount) {
    return this.getData('getAdminValidators', [adminAccount]);
  }

  GetValidators() {
    console.log(this.getData('getValidators'));
    return this.getData('getValidators');
  }

  GetAliasForAdmin(account) {
    return this.getData('getAliasForAdmin', [account]);
  }

  GetConsortiumName() {
    return this.getData('getConsortiumName', []);
  }

  UpdateAliasAsync(adminAlias) {
    return this.updateContract('updateAdminAlias', [adminAlias]);
  }

  ProposeAdminAsync(adminAccount, adminAlias) {
    return this.updateContract('proposeAdmin', [adminAccount, adminAlias]);
  }

  VoteAgainstAdminAsync(adminAccount) {
    return this.updateContract('voteAgainst', [adminAccount]);
  }

  VoteForProposedAdminAsync(adminAccount) {
    return this.updateContract('voteFor', [adminAccount]);
  }

  GetVotesForProposedAdmin(adminAccount) {
    return this.getData('countOfVotesFor', [adminAccount]);
  }

  GetVotesAgainstAdmin(adminAccount) {
    return this.getData('countOfVotesAgainst', [adminAccount]);
  }

  AddValidators(validatorAccounts) {
    return this.updateContract('addValidators', [validatorAccounts]);
  }

  RemoveValidator(validatorAccount) {
    return this.updateContract('removeValidators', [validatorAccount]);
  }

  GetHasAlreadyVotedFor(account) {
    return this.getData('hasAlreadyVotedFor', [account]);
  }

  GetCountOfVotesFor(account) {
    return this.getData('countOfVotesFor', [account]);
  }

  GetHasAlreadyVotedAgainst(account) {
    return this.getData('hasAlreadyVotedAgainst', [account]);
  }

  RescindVoteFor(account) {
    return this.updateContract('rescindVoteFor', [account]);
  }

  RescindVoteAgainst(account) {
    return this.updateContract('rescindVoteAgainst', [account]);
  }

  SetConsortiumName(accountName) {
    return this.updateContract('setConsortiumName', [accountName]);
  }

  getData(contractMethod, args) {
    return new Promise((resolve, reject) => {
      if (typeof args === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        args = [];
      }
      this.ValidatorContractEthereum[contractMethod].call(
        ...args, { from: this.currentAccount },
        (error, result) => {
          if (!error) {
console.log('youpi');
//console.log(this.getData('getValidators'));

            console.log(`${contractMethod}() success`);
            resolve(result);
          } else {
            console.log(`Error in ${contractMethod}(${args}): ${error}`);
            reject(error);
          }
        },
      );
    });
  }

  updateContract(contractMethod, args) {
    return new Promise((resolve, reject) => {
      this.ValidatorContractEthereum[contractMethod](
        ...args, {
          from: this.currentAccount,
          gasPrice: 0,
        },
        (error, transactionHash) => {
          if (!error) {
            console.log(`${contractMethod}(${args}) Transaction Hash: ${transactionHash}`);
            resolve(transactionHash);
          } else {
            console.log(`Error in ${contractMethod}(${args}): ${error}`);
            reject(error);
          }
        },
      );
    });
  }
}

export default ValidatorContract;
