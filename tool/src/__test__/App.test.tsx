import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeApp from "../employeeApp";

describe("Simple working test", () => {
	it("the title is visible", () => {
		render(<EmployeeApp mode="" />);
		expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
	});

	/*   it('should increment count on click', async () => {
    render(<WebApp mode=''/>)
    userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText(/count is 1/i)).toBeInTheDocument()
  })
 */
});
