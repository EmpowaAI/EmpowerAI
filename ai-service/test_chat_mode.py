import unittest
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chat_mode import has_loaded_twin_context


class TestChatModeSelection(unittest.TestCase):
    def test_explicit_twin_source_forces_advisor_mode(self):
        self.assertTrue(has_loaded_twin_context({"source": "twin"}))

    def test_explicit_cv_source_forces_quiz_mode(self):
        self.assertFalse(
            has_loaded_twin_context(
                {
                    "source": "cv",
                    "sections": {"skills": ["Python"], "experience": ["Developer"]},
                }
            )
        )

    def test_explicit_quiz_source_forces_quiz_mode(self):
        self.assertFalse(has_loaded_twin_context({"source": "quiz"}))

    def test_legacy_context_with_skills_enables_advisor_mode(self):
        self.assertTrue(
            has_loaded_twin_context(
                {"sections": {"skills": ["React"], "experience": []}}
            )
        )

    def test_empty_context_uses_quiz_mode(self):
        self.assertFalse(has_loaded_twin_context({}))
        self.assertFalse(has_loaded_twin_context(None))


if __name__ == "__main__":
    unittest.main()
