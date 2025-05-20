/**
 * DailySummary — all components now share the dynamic tint colour.
 */
import React, {useState, useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Button,
    Typography,
    Skeleton,
    Slider,
    IconButton,
    useTheme,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

/* ─── ColourStops Atom ────────────────────────────────────────────── */
const COLOUR_STOPS = [
    { t: 0,   rgb: [255, 204, 128] },
    { t: 0.3, rgb: [ 98, 195, 254] },
    { t: 0.6, rgb: [ 34, 129, 199] },
    { t: 1,   rgb: [125,  80, 163] },
];
const interpolateColour = (p) => {
    const idx = COLOUR_STOPS.findIndex((s) => p <= s.t);
    if (idx <= 0) return `rgb(${COLOUR_STOPS[0].rgb})`;
    const [a, b] = [COLOUR_STOPS[idx - 1], COLOUR_STOPS[idx]];
    const f = (p - a.t) / (b.t - a.t);
    const rgb = a.rgb.map((v, i) => Math.round(v + (b.rgb[i] - v) * f));
    return `rgb(${rgb.join(',')})`;
};
const GRADIENT = `linear-gradient(90deg, ${COLOUR_STOPS
    .map((s) => `rgb(${s.rgb.join(',')}) ${s.t * 100}%`)
    .join(',')})`;

/* ─── LoaderSkeleton Molecule ────────────────────────────────────── */
const LoaderSkeleton = () => (
    <Box sx={{ mt: 2 }}>
        <Skeleton animation="pulse" variant="rectangular" height={80}  sx={{ borderRadius: 22 }} />
        <Skeleton animation="pulse" variant="rectangular" height={6}   sx={{ my: 1, borderRadius: 3 }} />
        <Skeleton animation="pulse" variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
    </Box>
);

/* ─── PillHeader Atom ────────────────────────────────────────────── */
const PillHeader = ({ title, colour, onMenu }) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                background: colour,
                border:     `2px solid ${colour}`,
                borderRadius: '22px',
                px: 3, py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: theme.palette.getContrastText(colour) }}
            >
                {title}
            </Typography>
            <IconButton size="small" onClick={onMenu} sx={{ color: theme.palette.getContrastText(colour) }}>
                <MoreHorizIcon />
            </IconButton>
        </Box>
    );
};
PillHeader.propTypes = {
    title:  PropTypes.string.isRequired,
    colour: PropTypes.string.isRequired,
    onMenu: PropTypes.func,
};
PillHeader.defaultProps = {
    onMenu: () => {},
};

/* ─── DaySlider Molecule ─────────────────────────────────────────── */
const DaySlider = ({ position, onChange, colour }) => {
    const theme = useTheme();
    const step = 0.01;
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: 12,
                mt: '-6px',
                px: 2,
            }}
        >
            <Slider
                value={position}
                onChange={(_, v) => onChange(v)}
                min={0}
                max={1}
                step={step}
                sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    '& .MuiSlider-rail': {
                        height: 12,
                        borderRadius: 6,
                        background: GRADIENT,
                        opacity: 1,
                    },
                    '& .MuiSlider-track': { background: 'transparent' },
                    '& .MuiSlider-thumb': {
                        width: 24,
                        height: 24,
                        bgcolor: colour,
                        borderRadius: '50%',
                        boxShadow: theme.shadows[2],
                        marginTop: '-12px',
                        zIndex: 1,
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: `8px solid ${colour}`,
                            borderRadius: '1px 1px 0 0',
                        },
                        transition: 'background-color .3s',
                    },
                }}
            />
        </Box>
    );
};
DaySlider.propTypes = {
    position: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    colour:   PropTypes.string.isRequired,
};

/* ─── MealCard Molecule ──────────────────────────────────────────── */
const MealCard = ({ meal, colour }) => (
    <Card elevation={0} sx={{ border: `3px solid ${colour}`, borderRadius: 2, mt: 2 }}>
        <CardMedia
            component="img"
            height="180"
            image={meal.imageUrl}
            alt={meal.title}
            sx={{ borderBottom: `3px solid ${colour}` }}
        />
        <CardContent>
            <Typography variant="subtitle1" fontWeight={700}>
                {meal.timeLabel} – {meal.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {meal.calories} cal • {meal.protein} g protein
            </Typography>
        </CardContent>
    </Card>
);
MealCard.propTypes = {
    meal: PropTypes.shape({
        timeLabel: PropTypes.string.isRequired,
        title:     PropTypes.string.isRequired,
        calories:  PropTypes.number.isRequired,
        protein:   PropTypes.number.isRequired,
        imageUrl:  PropTypes.string.isRequired,
    }).isRequired,
    colour: PropTypes.string.isRequired,
};

/* ─── PlaceholderCard Molecule ───────────────────────────────────── */
const PlaceholderCard = ({ message, colour, onAdd }) => (
    <Card
        elevation={0}
        sx={{
            border: `3px dashed ${colour}`,
            borderRadius: 2,
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'text.secondary',
            p: 2,
            mt: 2,
        }}
    >
        <Typography variant="subtitle1" gutterBottom>
            {message}
        </Typography>
        <Button variant="contained" onClick={onAdd} size="small">
            Add meal
        </Button>
    </Card>
);
PlaceholderCard.propTypes = {
    message: PropTypes.string.isRequired,
    colour:  PropTypes.string.isRequired,
    onAdd:   PropTypes.func,
};
PlaceholderCard.defaultProps = {
    onAdd: () => {},
};

/* ─── DailySummary Organism ───────────────────────────────────────── */
export default function DailySummary({ meals, loading, onAddMeal, nutritionTargets }) {
    // 1‑second heartbeat loader
    const [pulse, setPulse] = useState(loading);
    const computePos = () => {
        const now = new Date();
        const raw = (now.getHours() + now.getMinutes() / 60 - 6) / 18;
        return Math.min(1, Math.max(0, raw));
    };
    const [pos, setPos] = useState(computePos);

    const list = useMemo(
        () => (Array.isArray(meals) ? meals : []),
        [meals]
    );
    const total = list.length;
    const baseColour = interpolateColour(0);

    useEffect(() => {
        if (!loading) return setPulse(false);
        const id = setTimeout(() => setPulse(false), 1000);
        return () => clearTimeout(id);
    }, [loading]);

    // auto-update slider position every minute based on current time
    useEffect(() => {
        const update = () => setPos(computePos());
        update();
        const id = setInterval(update, 60_000);
        return () => clearInterval(id);
    }, []);

    const totals = useMemo(
        () => list.reduce((acc, m) => ({
            calories: acc.calories + (m.calories || 0),
            protein:  acc.protein  + (m.protein  || 0),
            carbohydrates: acc.carbohydrates + (m.carbohydrates || 0),
            fat: acc.fat + (m.fat || 0),
        }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }),
        [list]
    );

    const remaining = useMemo(() => ({
        calories: Math.max((nutritionTargets?.calories || 0) - totals.calories, 0),
        protein: Math.max((nutritionTargets?.protein || 0) - totals.protein, 0),
        carbohydrates: Math.max((nutritionTargets?.carbohydrates || 0) - totals.carbohydrates, 0),
        fat: Math.max((nutritionTargets?.fat || 0) - totals.fat, 0),
    }), [nutritionTargets, totals]);

    if (pulse) return <LoaderSkeleton />;

    return (
        <Box sx={{ mt: 2 }}>
            <PillHeader title="YOUR DAY" colour={baseColour} onMenu={() => {}} />

            {total ? (
                list.map((m, i) => (
                    <MealCard
                        key={i}
                        meal={m}
                        colour={interpolateColour(total === 1 ? 0 : i / (total - 1))}
                    />
                ))
            ) : (
                <PlaceholderCard
                    message="No meals planned for today"
                    colour={baseColour}
                    onAdd={onAddMeal}
                />
            )}

            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Remaining: {remaining.calories} cal · {remaining.protein} g protein · {remaining.carbohydrates} g carbs · {remaining.fat} g fat
                </Typography>
            </Box>
        </Box>
    );
}

DailySummary.propTypes = {
    loading:   PropTypes.bool,
    meals:     PropTypes.arrayOf(
        PropTypes.shape({
            timeLabel:    PropTypes.string.isRequired,
            title:        PropTypes.string.isRequired,
            calories:     PropTypes.number.isRequired,
            protein:      PropTypes.number.isRequired,
            carbohydrates:PropTypes.number,
            fat:          PropTypes.number,
            imageUrl:     PropTypes.string.isRequired,
        })
    ),
    nutritionTargets: PropTypes.shape({
        calories:     PropTypes.number,
        protein:      PropTypes.number,
        carbohydrates:PropTypes.number,
        fat:          PropTypes.number,
    }),
    onAddMeal: PropTypes.func,
};
DailySummary.defaultProps = {
    loading:   false,
    meals:     [],
    nutritionTargets: null,
    onAddMeal: () => {},
};
