import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { userAPI, extractResponseData } from "../../services/api";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetId: string;
  type: "user" | "property";
  onSuccess?: () => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  targetId,
  type,
  onSuccess,
}) => {
  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        reason,
        description,
        [type === "user" ? "targetUser" : "targetProperty"]: targetId,
      };
      const res = await (userAPI as any).reportUser(payload);
      const data = extractResponseData(res as any) as any;
      // backend may return message or simple success
      if (data && data.message) {
        console.log("Report submitted:", data.message);
      }
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.msg || "Failed to submit report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report {type === "user" ? "User" : "Listing"}</DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            Thank you. Your report has been submitted and will be reviewed by
            our team.
          </Alert>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please select a reason for reporting this {type}.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Reason</FormLabel>
              <RadioGroup
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <FormControlLabel
                  value="spam"
                  control={<Radio />}
                  label="Spam / Misleading"
                />
                <FormControlLabel
                  value="fraud"
                  control={<Radio />}
                  label="Fraud / Scam"
                />
                <FormControlLabel
                  value="harassment"
                  control={<Radio />}
                  label="Harassment"
                />
                <FormControlLabel
                  value="inappropriate_content"
                  control={<Radio />}
                  label="Inappropriate Content"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label="Other"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Details (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context to help us understand the issue..."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {success ? "Close" : "Cancel"}
        </Button>
        {!success && (
          <Button
            onClick={handleSubmit}
            color="error"
            variant="contained"
            disabled={loading || !reason}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
