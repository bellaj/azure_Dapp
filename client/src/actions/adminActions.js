import * as types from './actionTypes';
import { toastTimer } from '../common/constants';
import { helper } from '../common/utils';

const setMembers = members => ({
  type: types.SET_MEMBERS,
  payload: members,
});

const setCandidates = candidates => ({
  type: types.SET_CANDIDATES,
  payload: candidates,
});

const setIsAdmin = bool => ({
  type: types.IS_ADMIN,
  payload: bool,
});

export const isToastVisible = bool => ({
  type: types.IS_TOAST_VISIBLE,
  payload: bool,
});

export const setToastMessage = message => ({
  type: types.SET_TOAST_MESSAGE,
  payload: message,
});

const getPercentVote = (membersCount, voteCount) =>
  Number((voteCount / membersCount) * 100).toFixed(0);

const getVotesNeeded = (membersCount, voteCount) => {
  const moreThanFiftyPercent = Math.floor(membersCount / 2) + 1;
  return moreThanFiftyPercent - Number(voteCount);
};

const isSignedInUserAdmin = () => (dispatch, getState) => {
  const { currentAccount } = getState().user;
  const { members } = getState().administrator;
  const isAdmin = members.find(member => member.address === currentAccount);
  dispatch(setIsAdmin(!!isAdmin));
};

export const getCandidates = membersLength => (dispatch, getState) => {
  console.log('GET CANDIDATES -- ADMIN ACTIONS');
  let membersCount = membersLength;
  const { members } = getState().administrator;
  if (typeof membersLength === 'undefined') {
    membersCount = members.length;
  }
  const candidates = [];
  helper.GetProposedAdminsAsync()
    .then(res =>
      Promise.all(res.map(eachCandidate =>
        helper.GetAliasForAdmin(eachCandidate)
          .then((aliasResult) => {
            candidates.push({
              address: eachCandidate,
              alias: aliasResult,
            });
          }))))
    .then(() =>
      Promise.all(candidates.map((candidate, index, array) =>
        helper.GetVotesForProposedAdmin(candidate.address)
          .then((voteCount) => {
            const copyArr = array;
            const percentVoted = getPercentVote(membersCount, voteCount);
            const votesNeeded = getVotesNeeded(membersCount, voteCount);
            copyArr[index] = {
              ...candidate,
              voteCount: Number(voteCount.toString()),
              percentVoted,
              votesNeeded,
            };
            return copyArr;
          }))))
    .then(() => Promise.all(candidates.map((candidate, index, array) =>
      helper.GetHasAlreadyVotedFor(candidate.address)
        .then((res) => {
          const copyArr = array;
          copyArr[index] = {
            ...candidate,
            hasVoted: res,
          };
          return copyArr;
        }))))
    .then(() => {
      dispatch(setCandidates(candidates));
    });
};

export const getAdmins = () => (dispatch, getState) => {
  console.log('GET ADMINS - ADMIN ACTIONS');
  const members = [];
  helper.GetAdminsAsync()
    .then(res =>
      Promise.all(res.map(eachAdmin =>
        helper.GetAliasForAdmin(eachAdmin)
          .then((aliasResult) => {
            members.push({
              address: eachAdmin,
              alias: aliasResult,
            });
          }))))
    .then(() => {
      dispatch(getCandidates(members.length));
    })
    .then(() =>
      Promise.all(members.map((member, index, array) =>
        helper.GetVotesAgainstAdmin(member.address)
          .then((voteCount) => {
            const copyArr = array;
            const percentVoted = 100 - getPercentVote(members.length, voteCount);
            const votesNeeded = getVotesNeeded(members.length, voteCount);
            copyArr[index] = {
              ...member,
              voteCount: Number(voteCount.toString()),
              percentVoted,
              votesNeeded,
            };
            return copyArr;
          }))))
    .then(() => Promise.all(members.map((member, index, array) =>
      helper.GetHasAlreadyVotedAgainst(member.address)
        .then((res) => {
          const copyArr = array;
          copyArr[index] = {
            ...member,
            hasVoted: res,
          };
          return copyArr;
        }))))
    .then(() => {
      dispatch(setMembers(members));
      dispatch(isSignedInUserAdmin());
    });
};

export const dismissToast = bool => (dispatch) => {
  dispatch(isToastVisible(bool));
};

export const startToastTimer = () => (dispatch) => {
  setTimeout(() => {
    dispatch(dismissToast(false));
  }, toastTimer);
};

export const addAdmin = (address, alias) => (dispatch) => {
  dispatch(isToastVisible(false));
  helper.ProposeAdminAsync(address, alias)
    .then((txHash) => {
      dispatch(setToastMessage({
        row1: `You nominated ${alias}`,
        row2: txHash,
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(`You nominated ${alias}. TxHash: ${txHash}`);
    })
    .catch((error) => {
      dispatch(setToastMessage({
        row1: 'You cancelled your request',
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
    });
};

export const updateAdmin = newAlias => (dispatch) => {
  dispatch(isToastVisible(false));
  console.log(`User wants to update alias: ${newAlias}`);
  helper.UpdateAliasAsync(newAlias)
    .then((txHash) => {
      dispatch(setToastMessage({
        row1: 'You updated your alias',
        row2: txHash,
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
    })
    .catch((error) => {
      dispatch(setToastMessage({ row1: 'You cancelled your request' }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
    });
};

export const voteAdminOut = (address, alias) => (dispatch) => {
  dispatch(isToastVisible(false));
  console.log(`Voting Admin with address: ${address} out`);
  helper.VoteAgainstAdminAsync(address)
    .then((txHash) => {
      dispatch(setToastMessage({
        row1: `You voted ${alias} out`,
        row2: txHash,
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(`Vote against admin ${alias}. TxHash: ${txHash}`);
    })
    .catch((error) => {
      dispatch(setToastMessage({ row1: 'You cancelled your request' }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
    });
};

export const voteCandidateIn = (address, alias) => (dispatch) => {
  dispatch(isToastVisible(false));
  console.log(`Voting candidate with address of ${address} in.`);
  helper.VoteForProposedAdminAsync(address)
    .then((txHash) => {
      dispatch(setToastMessage({
        row1: `You voted for ${alias}`,
        row2: txHash,
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(`Voted ${alias} in. TxHash: ${txHash}`);
    })
    .catch((error) => {
      dispatch(setToastMessage({ row1: 'You cancelled your request' }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
    });
};

export const rescindVoteAgainst = (address, alias) => (dispatch) => {
  dispatch(isToastVisible(false));
  helper.RescindVoteAgainst(address)
    .then((txHash) => {
      dispatch(setToastMessage({
        row1: `You rescinded your vote against ${alias}`,
        row2: txHash,
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(`rescinded vote against ${alias}, TxHash: ${txHash}`);
    })
    .catch((error) => {
      dispatch(setToastMessage({ row1: 'You cancelled your request' }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(error, 'cancelled transaction');
    });
};

export const rescindVoteFor = (address, alias) => (dispatch) => {
  dispatch(isToastVisible(false));
  helper.RescindVoteFor(address)
    .then((txHash) => {
      let notificationAlias = alias;
      if (!notificationAlias) {
        notificationAlias = 'candidate';
      }
      dispatch(setToastMessage({
        row1: `You rescinded your vote for ${notificationAlias}`,
        row2: txHash,
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(`rescinding vote for ${alias}, TxHash: ${txHash}`);
    })
    .catch((error) => {
      dispatch(setToastMessage({ row1: 'You cancelled your request' }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(error, 'cancelled transaction');
    });
};
