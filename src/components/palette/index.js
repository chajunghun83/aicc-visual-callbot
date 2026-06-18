// 콘텐츠 팔레트 레지스트리.
// 시나리오 스텝의 show: '<컴포넌트명>' 문자열을 실제 컴포넌트로 매핑한다.
// 엔진/시나리오는 이 레지스트리에 등록된 이름만 사용한다(고정 팔레트 + 서버 주도 노출).
import InfoMessageCard from './InfoMessageCard.vue'
import ChoiceButtons from './ChoiceButtons.vue'
import IdentityVerify from './IdentityVerify.vue'
import DataCard from './DataCard.vue'
import FileUpload from './FileUpload.vue'
import AnalysisResult from './AnalysisResult.vue'
import SuggestionButtons from './SuggestionButtons.vue'
import StockPicker from './StockPicker.vue'
import StockDetail from './StockDetail.vue'
import MarketBoard from './MarketBoard.vue'

export const paletteComponents = {
  InfoMessageCard,
  ChoiceButtons,
  IdentityVerify,
  DataCard,
  FileUpload,
  AnalysisResult,
  SuggestionButtons,
  StockPicker,
  StockDetail,
  MarketBoard,
}
