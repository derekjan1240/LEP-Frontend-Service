import NavTabs from "./components/NavTabs";
import { Container, Grid, Box } from "@material-ui/core";

export default function Questionaire() {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box p={5}>
            <NavTabs />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

// 學習準備度 => 前測
// 學習興趣 => 量表
// 學習風格 => 量表
