import React from 'react';
import {
    Box,
    Button,
    FormHelperText,
    InputLabel,
    Tooltip,
} from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';

const FilePicker = ({
    onChange: handleImage,
    imageUrl,
    helperText,
    labelTop,
    error: propsError,
    accept = ".jpg,.jpeg,.png",
    boxWidth = "100px",
    boxHeight = "56px",
    alt = "logo.png",
    title: propsTitle
}) => {
    return (
        <>
            {labelTop && <InputLabel
                sx={{
                    marginBottom: "5px",
                    color: "#000",
                }}
            >
                {labelTop}
            </InputLabel>}
            <input type="file" hidden id="file-input" onChange={handleImage} accept={accept} />
            <Tooltip title={propsTitle} placement="top" arrow>
                <Button variant="text" sx={{ position: "relative" }} onClick={() => { }}>
                    <Box component="label" htmlFor="file-input" sx={{ cursor: "pointer", width: boxWidth, height: boxHeight, backgroundColor: "#ccc" }}>
                        {imageUrl ?
                            <img src={imageUrl} width={boxWidth} height={boxHeight} alt={alt} />
                            :
                            <Box sx={{
                                backgroundColor: "#ffffffa3",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%,-50%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }} children={<FileUploadIcon sx={{ color: "#ccc" }} />} />
                        }
                    </Box>
                </Button>
            </Tooltip>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
            {propsError && <FormHelperText sx={{ color: "red", mt: "0 !important" }}>{propsError}</FormHelperText>}
        </>
    );
};

export default FilePicker;
