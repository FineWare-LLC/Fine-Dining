import { Box, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

export default function ProfileDetailItem({ icon, term, definition, tooltip }) {
    const content = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && <Box component="span">{icon}</Box>}
            <Box>
                <Typography component="dt" variant="subtitle2">
                    {term}
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                    {definition}
                </Typography>
            </Box>
        </Box>
    );

    return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
}

ProfileDetailItem.propTypes = {
    icon: PropTypes.node,
    term: PropTypes.node.isRequired,
    definition: PropTypes.node.isRequired,
    tooltip: PropTypes.string,
};

ProfileDetailItem.defaultProps = {
    icon: null,
    tooltip: '',
};

