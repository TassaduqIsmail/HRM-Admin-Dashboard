import React from 'react';
export default function usePageTitle(title) {
    React.useEffect(() => {
        const prevTitle = document.title
        document.title = title + ' | Dashboard'
        return () => {
            document.title = prevTitle
        }
    })
}