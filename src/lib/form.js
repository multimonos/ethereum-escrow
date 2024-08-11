export const modelOptionsForSelect = ( { data, label, value, selected } ) =>
    data.map( ( x, i ) => ({
        label: typeof (label) === 'function' ? label( x, i ) : x[label],
        value: typeof (value) === 'function' ? value( x, i ) : x[value],
    }) )