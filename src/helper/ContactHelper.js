export const getFullName = (contact) => {
    if (!contact || (!contact?.last_name && !contact?.first_name)) {
        return null;
    }
    return (contact?.last_name + ' ' + contact?.first_name).trim();
}
