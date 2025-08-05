import { Typography } from '@mui/material';

const ResponsiveTypography = ({ 
  children, 
  variant = 'body1',
  fontSize = {},
  sx = {},
  ...props 
}) => {
  const defaultFontSizes = {
    h1: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
    h2: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
    h3: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
    h4: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
    h5: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.5rem' },
    h6: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' },
    body1: { xs: '0.875rem', sm: '1rem', md: '1rem', lg: '1.125rem' },
    body2: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem', lg: '1rem' },
    caption: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem', lg: '0.875rem' },
  };

  const getFontSize = () => {
    if (fontSize && Object.keys(fontSize).length > 0) {
      return fontSize;
    }
    return defaultFontSizes[variant] || defaultFontSizes.body1;
  };

  return (
    <Typography
      variant={variant}
      sx={{
        fontSize: getFontSize(),
        lineHeight: 1.4,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default ResponsiveTypography; 