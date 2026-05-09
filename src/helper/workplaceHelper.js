export const getWorkplaceDomain = () => {
    const hotName = window.location.hostname;
    const domainParts = hotName.split('.');
    if (domainParts.length < 3) {
        return null;
    }
    return domainParts[0];
}
