switch (AMemoryReborn.windowPurpose) {
    case 'overlay':
        import('./overlay/renderer');
        break;
    case 'selector':
        import('./selector/renderer');
        break;
    default:
        alert('invalid window purpose!');
}
