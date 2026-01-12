import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  return (
    <div>
      <Tooltip title="Change Language">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2, color: 'inherit' }}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem 
            onClick={() => changeLanguage('en')}
            selected={i18n.language === 'en'}
        >
            English
        </MenuItem>
        <MenuItem 
            onClick={() => changeLanguage('hi-en')}
            selected={i18n.language === 'hi-en'}
        >
            Hinglish (India)
        </MenuItem>
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;
