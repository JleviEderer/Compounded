
# Project Development Rules & Guidelines

## Code Quality Standards

### Constants Over Magic Numbers
- Replace hard-coded values with named constants
- Use descriptive constant names that explain the value's purpose
- Keep constants at the top of the file or in a dedicated constants file

### Meaningful Names
- Variables, functions, and classes should reveal their purpose
- Names should explain why something exists and how it's used
- Avoid abbreviations unless they're universally understood

### Smart Comments
- Don't comment on what the code does - make the code self-documenting
- Use comments to explain why something is done a certain way
- Document APIs, complex algorithms, and non-obvious side effects

### Single Responsibility
- Each function should do exactly one thing
- Functions should be small and focused
- If a function needs a comment to explain what it does, it should be split

### DRY (Don't Repeat Yourself)
- Extract repeated code into reusable functions
- Share common logic through proper abstraction
- Maintain single sources of truth

### Clean Structure
- Keep related code together
- Organize code in a logical hierarchy
- Use consistent file and folder naming conventions

### Encapsulation
- Hide implementation details
- Expose clear interfaces
- Move nested conditionals into well-named functions

## AI Assistant Guidelines

### Information Verification
- Always verify information before presenting it
- Do not make assumptions or speculate without clear evidence

### Change Management
- Make changes file by file and allow review
- Provide all edits in a single chunk per file
- Don't suggest updates when no modifications are needed

### Communication Style
- Never use apologies in responses
- Avoid giving feedback about understanding in comments
- Don't ask for confirmation of information already in context
- Don't ask users to verify implementations visible in context

### Code Preservation
- Don't remove unrelated code or functionalities
- Pay attention to preserving existing structures
- Don't suggest whitespace-only changes
- Don't invent changes beyond what's explicitly requested

### Documentation
- Don't summarize changes made
- Provide links to real files, not placeholder names
- Don't show current implementation unless specifically requested

## Project-Specific Rules

### File Structure Preservation
- Maintain the existing project structure as defined in the requirements
- Keep the cleaner/ module organization intact
- Preserve the test structure and naming conventions

### Dependencies
- Only use approved dependencies: pandas, beautifulsoup4, lxml, ruff, black, pytest
- Don't suggest additional libraries without explicit permission

### Memory Constraints
- Maintain stream processing to keep RAM usage under 300MB
- Don't implement solutions that would significantly increase memory usage

### Error Handling
- Preserve the existing logging format: "YYYY-MM-DD HH:MM:SS | LEVEL | message"
- Maintain graceful error handling for malformed HTML
- Keep the warning-and-continue behavior for individual table parse errors

### Testing
- Write tests before fixing bugs
- Keep tests readable and maintainable
- Test edge cases and error conditions
- Maintain the existing test structure in tests/

### Code Quality Maintenance
- Ensure code passes ruff and black formatting
- Refactor continuously but preserve functionality
- Fix technical debt early
- Leave code cleaner than found

## Boundaries and Constraints

### What NOT to Change
- Core data cleaning logic without explicit permission
- File naming conventions established in the project
- The CLI interface contract
- Existing API signatures in the cleaner module
- Test file structure and naming

### What CAN be Changed
- Implementation details within existing functions
- Performance optimizations that don't break the API
- Bug fixes that maintain backward compatibility
- Documentation improvements
- Adding new optional features that don't break existing functionality

### Version Control
- Write clear commit messages
- Make small, focused commits
- Use meaningful branch names
- Document breaking changes clearly

## Compliance
All changes must adhere to these rules. Any deviation requires explicit approval and justification.
