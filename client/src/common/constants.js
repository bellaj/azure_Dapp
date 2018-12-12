export const setBlockErrorMessage = 'The web server and Metamask block hashes do not match. You may not be connected to the same ethereum network in Metamask';

export const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

export const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export const administratorColumnsNames = [
  { fieldName: 'address', name: 'Address' },
  { fieldName: 'alias', name: 'Alias' },
  { fieldName: 'percentVoted', name: 'Current admin' },
  { fieldName: 'yourVote', name: 'Your vote' },
];

export const validatorColumnsNames = [
  { fieldName: 'nodeType', name: 'Node type' },
  { fieldName: 'address', name: 'Address' },
  { fieldName: 'hostname', name: 'Associated VM' },
  { fieldName: 'peercount', name: 'Peer count' },
  { fieldName: 'blocknumber', name: 'Block number' },
];

export const membersDescription = {
  top: 'Administrators represent the different consortium members on the network.',
  bottom: 'They have the power to govern the consortium network through voting.',
};

export const candidatesDescription = {
  top: 'A candidate becomes an admin once they receive votes greater than 50 percent from the current administrators.',
  bottom: '',
};

export const addPanelFields = [
  {
    displayName: 'ETHEREUM ADDRESS',
    name: 'address',
    placeholder: 'Ex: 0x17Bf5e7b3CE6779DBaeDEB907010601A8c1e3118',
    required: true,
    type: 'address',
  },
  {
    displayName: 'ALIAS',
    name: 'alias',
    placeholder: 'Ex: Admin 2',
    required: true,
    type: 'string',
  },
];

export const editPanelFields = [
  {
    displayName: 'ALIAS',
    name: 'alias',
    placeholder: 'Ex: Admin 2',
    required: true,
    type: 'string',
  },
];

export const settingPanelFields = [
  {
    displayName: 'CONSORTIUM NAME',
    name: 'consortiumName',
    placeholder: 'Northwind Traders Consortium',
    required: true,
    type: 'string',
  },
];

export const errorStates = {
  string: {
    tooLong: 'Field cannot exceed 40',
  },
  address: {
    invalid: 'Invalid input',
  },
  empty: {
    empty: 'Field cannot be empty',
  },
};

export const adminStatusMessages = {
  excellent: "You're in excellent standing within the consortium.",
  moderate: "You're in moderate standing within the consortium.",
  poor: "You're at risk of being voted out.",
  extremelyPoor: "You're at risk of being voted out. One vote till majority.",
};

export const toastTimer = 30000;
