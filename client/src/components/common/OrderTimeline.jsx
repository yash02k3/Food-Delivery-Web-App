import { Box, Typography, Stepper, Step, StepLabel, StepContent, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function OrderTimeline({ tracking = [], status }) {
  const steps = tracking.length
    ? tracking
    : [
        { title: 'Order Placed', status: 'placed', completed: true },
        { title: 'Confirmed', status: 'confirmed', completed: false },
        { title: 'Packed', status: 'packed', completed: false },
        { title: 'Out for Delivery', status: 'out_for_delivery', completed: false },
        { title: 'Delivered', status: 'delivered', completed: false },
      ];

  const activeStep = steps.findIndex((s) => s.status === status);
  const currentStep = activeStep >= 0 ? activeStep : 0;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Live Order Tracking
      </Typography>
      <Stepper activeStep={currentStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.status || index} completed={step.completed}>
            <StepLabel
              StepIconComponent={() =>
                step.completed ? (
                  <CheckCircleIcon color="primary" />
                ) : (
                  <RadioButtonUncheckedIcon color="disabled" />
                )
              }
            >
              <Typography fontWeight={600}>{step.title}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {step.description || (step.completed ? 'Completed' : 'Pending')}
              </Typography>
              {step.timestamp && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(step.timestamp).toLocaleString('en-IN')}
                </Typography>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
}
