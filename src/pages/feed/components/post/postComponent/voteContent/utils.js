export const getVoteFileUrl = file => (typeof file === 'string' ? file.split('?')[0] : file);
